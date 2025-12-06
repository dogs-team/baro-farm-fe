#!/bin/bash

# ===================================
# 롤백 스크립트
# 이전 버전으로 안전하게 롤백
# Usage: bash rollback.sh [TAG]
# Example: bash rollback.sh main-frontend-abc123
# ===================================

set -e

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# ===================================
# 파라미터 검증
# ===================================
TARGET_TAG=$1

if [ -z "$TARGET_TAG" ]; then
    log_warn "태그를 지정하지 않았습니다. 사용 가능한 태그 목록을 확인하세요."
    echo ""
    echo "사용법:"
    echo "1. GitHub Packages에서 사용 가능한 태그 확인"
    echo "   https://github.com/do-develop-space?tab=packages"
    echo ""
    echo "2. 또는 최근 배포 이력 확인"
    echo "   cat ~/apps/FE/deployment-history.log"
    echo ""
    echo "3. 또는 버전 목록 확인"
    echo "   bash list-versions.sh"
    echo ""
    echo "4. 태그를 지정하여 다시 실행"
    echo "   bash rollback.sh [TAG]"
    echo ""
    echo "Examples:"
    echo "  bash rollback.sh main-frontend-abc123"
    echo "  bash rollback.sh main-frontend-20241205-143022"
    echo "  bash rollback.sh latest"
    exit 1
fi

# ===================================
# 환경 변수
# ===================================
GITHUB_USERNAME="${GITHUB_USERNAME:-do-develop-space}"
DOCKER_REGISTRY="ghcr.io/${GITHUB_USERNAME}"
SERVICE_NAME="barofarm-frontend"
PROJECT_DIR="${HOME}/apps/FE"

# 디렉토리 생성 (없으면)
mkdir -p ${PROJECT_DIR}

cd ${PROJECT_DIR}

log_info "🔄 Starting rollback for frontend to tag: ${TARGET_TAG}"

# ===================================
# 1. 현재 버전 백업
# ===================================
log_step "📸 Backing up current version..."
COMPOSE_FILE="docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# 현재 실행 중인 이미지 정보 저장
CURRENT_IMAGE=$(docker inspect "${SERVICE_NAME}" --format='{{.Config.Image}}' 2>/dev/null || echo "none")
log_info "Current image: $CURRENT_IMAGE"

# 배포 이력 저장
mkdir -p ${PROJECT_DIR}
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rollback: frontend from $CURRENT_IMAGE to $DOCKER_REGISTRY/${SERVICE_NAME}:$TARGET_TAG" >> ~/apps/FE/deployment-history.log

# ===================================
# 2. 타겟 이미지 Pull
# ===================================
log_step "📥 Pulling target image..."
TARGET_IMAGE="${DOCKER_REGISTRY}/${SERVICE_NAME}:${TARGET_TAG}"

if ! docker pull "$TARGET_IMAGE"; then
    log_error "Failed to pull image: $TARGET_IMAGE"
    log_info "사용 가능한 태그를 확인하세요: https://github.com/${GITHUB_USERNAME}?tab=packages"
    exit 1
fi

log_info "✅ Successfully pulled: $TARGET_IMAGE"

# ===================================
# 3. 기존 컨테이너 중지
# ===================================
log_step "🛑 Stopping current container..."
docker-compose down || true

# 컨테이너 백업 (이름 변경)
BACKUP_NAME="${SERVICE_NAME}-backup-$(date '+%Y%m%d-%H%M%S')"
log_info "Backup created: $BACKUP_NAME"

# ===================================
# 4. 새 버전으로 시작
# ===================================
log_step "🏃 Starting with target version..."

# docker-compose.yml에서 이미지 설정 업데이트
if [ -f docker-compose.yml ]; then
    # build 섹션을 주석 처리하고 image 추가
    sed -i.bak "s|build:|# build:|g" docker-compose.yml || true
    if ! grep -q "image:" docker-compose.yml; then
        # image 라인이 없으면 추가
        sed -i.bak "/container_name:/a\\
    image: ${TARGET_IMAGE}
" docker-compose.yml || true
    else
        # image 라인이 있으면 업데이트
        sed -i.bak "s|image:.*|image: ${TARGET_IMAGE}|g" docker-compose.yml || true
    fi
fi

docker-compose up -d

# ===================================
# 5. Health Check
# ===================================
log_step "🏥 Waiting for health check..."
sleep 10

# Health check (최대 30초 대기)
for i in {1..10}; do
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "✅ Health check passed!"
        break
    fi
    if [ $i -eq 10 ]; then
        log_error "❌ Health check failed!"
        log_warn "Rolling back to previous version..."
        
        # 롤백 실패 시 이전 버전 복원
        docker-compose down || true
        
        # 이전 이미지로 복원 시도
        if [ "$CURRENT_IMAGE" != "none" ]; then
            sed -i.bak "s|image:.*|image: ${CURRENT_IMAGE}|g" docker-compose.yml || true
            docker-compose up -d || true
        fi
        
        log_error "Rollback failed. Please check logs: docker-compose logs"
        exit 1
    fi
    log_info "Waiting for service to be ready... ($i/10)"
    sleep 3
done

# ===================================
# 6. 완료
# ===================================
log_info "🎉 Rollback completed successfully!"
log_info "Service: ${SERVICE_NAME}"
log_info "Version: $TARGET_TAG"
log_info "Container: ${SERVICE_NAME}"

# 상태 표시
docker-compose ps

log_info "📝 Deployment history: ~/apps/FE/deployment-history.log"

