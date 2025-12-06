#!/bin/bash

set -e

# 환경 변수 확인
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN is not set"
  exit 1
fi

if [ -z "$REGISTRY" ]; then
  REGISTRY="ghcr.io"
fi

if [ -z "$IMAGE_NAME" ]; then
  IMAGE_NAME="do-develop-space"
fi

if [ -z "$SERVICE_NAME" ]; then
  SERVICE_NAME="barofarm-frontend"
fi

# 브랜치명 추출 (환경 변수 또는 git에서)
if [ -z "$GITHUB_REF" ]; then
  # 로컬 실행 시 git에서 브랜치명 가져오기
  BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
else
  BRANCH_NAME=$(echo ${GITHUB_REF#refs/heads/} | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
fi

# 이미지 태그 결정 (브랜치명 기반)
IMAGE_TAG="${BRANCH_NAME}"
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}/${SERVICE_NAME}:${IMAGE_TAG}"
LATEST_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}/${SERVICE_NAME}:latest"

echo "🚀 Deploying frontend..."
echo "📦 Image: ${FULL_IMAGE_NAME}"
echo "🏷️  Tag: ${IMAGE_TAG}"

# 작업 디렉토리 설정
DEPLOY_DIR="/home/${USER}/apps/FE"
mkdir -p ${DEPLOY_DIR}
cd ${DEPLOY_DIR}

# Docker 로그인
echo "🔐 Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ${REGISTRY} -u do-develop-space --password-stdin

# 기존 컨테이너 중지 및 제거
echo "🛑 Stopping existing containers..."
docker-compose down || true

# 오래된 이미지 정리 (선택사항)
echo "🧹 Cleaning up old images..."
docker image prune -f || true

# 최신 이미지 Pull 시도
echo "📥 Pulling latest image..."
if docker pull ${FULL_IMAGE_NAME} 2>/dev/null; then
  echo "✅ Pulled ${FULL_IMAGE_NAME}"
  IMAGE_TO_USE=${FULL_IMAGE_NAME}
elif docker pull ${LATEST_IMAGE_NAME} 2>/dev/null; then
  echo "✅ Pulled ${LATEST_IMAGE_NAME}"
  IMAGE_TO_USE=${LATEST_IMAGE_NAME}
else
  echo "⚠️  Image not found in registry, building locally..."
  IMAGE_TO_USE=""
fi

# docker-compose.yml에서 이미지 설정
if [ -f docker-compose.yml ]; then
  if [ -n "$IMAGE_TO_USE" ]; then
    # 이미지가 있는 경우 docker-compose.yml 수정
    echo "📝 Updating docker-compose.yml with image: ${IMAGE_TO_USE}"
    # build 섹션을 주석 처리하고 image 추가
    sed -i.bak "s|build:|# build:|g" docker-compose.yml || true
    if ! grep -q "image:" docker-compose.yml; then
      # image 라인이 없으면 추가
      sed -i.bak "/container_name:/a\\
    image: ${IMAGE_TO_USE}
" docker-compose.yml || true
    else
      # image 라인이 있으면 업데이트
      sed -i.bak "s|image:.*|image: ${IMAGE_TO_USE}|g" docker-compose.yml || true
    fi
  fi
fi

# 컨테이너 시작
echo "🚀 Starting containers..."
if [ -n "$IMAGE_TO_USE" ]; then
  docker-compose up -d
else
  docker-compose up -d --build
fi

# 헬스 체크
echo "🏥 Health check..."
sleep 10

# 컨테이너 상태 확인
if docker-compose ps | grep -q "Up"; then
  echo "✅ Frontend deployed successfully!"
  docker-compose ps
  docker-compose logs --tail=20 frontend
  
  # 배포 이력 기록
  DEPLOYED_IMAGE=$(docker inspect ${SERVICE_NAME} --format='{{.Config.Image}}' 2>/dev/null || echo "unknown")
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy: frontend to ${DEPLOYED_IMAGE} (tag: ${IMAGE_TAG})" >> ~/apps/FE/deployment-history.log
else
  echo "❌ Deployment failed!"
  docker-compose ps
  docker-compose logs frontend
  exit 1
fi

echo "✨ Deployment completed!"

