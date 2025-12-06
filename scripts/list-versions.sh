#!/bin/bash

# ===================================
# 이미지 버전 목록 확인 스크립트
# GitHub Container Registry에 저장된 버전들 확인
# Usage: bash list-versions.sh
# ===================================

set -e

# 색상
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

GITHUB_USERNAME="${GITHUB_USERNAME:-do-develop-space}"
SERVICE_NAME="barofarm-frontend"
PACKAGE_NAME="${SERVICE_NAME}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Available versions for: ${PACKAGE_NAME}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ===================================
# 1. 로컬 이미지 확인
# ===================================
echo -e "${YELLOW}🖥️  Local images:${NC}"
docker images "ghcr.io/${GITHUB_USERNAME}/${PACKAGE_NAME}" --format "table {{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "  No local images found"
echo ""

# ===================================
# 2. 배포 이력 확인
# ===================================
if [ -f ~/apps/FE/deployment-history.log ]; then
    echo -e "${YELLOW}📋 Recent deployments:${NC}"
    grep "${PACKAGE_NAME}" ~/apps/FE/deployment-history.log | tail -5 || echo "  No deployment history"
    echo ""
fi

# ===================================
# 3. GitHub Container Registry 확인 안내
# ===================================
echo -e "${YELLOW}🌐 Remote registry (GHCR):${NC}"
echo "  Visit: https://github.com/${GITHUB_USERNAME}?tab=packages"
echo "  Package: ${PACKAGE_NAME}"
echo ""

# ===================================
# 4. 현재 실행 중인 버전
# ===================================
echo -e "${YELLOW}🏃 Currently running:${NC}"
CURRENT_IMAGE=$(docker inspect "${SERVICE_NAME}" --format='{{.Config.Image}}' 2>/dev/null || echo "Not running")
CURRENT_CREATED=$(docker inspect "${SERVICE_NAME}" --format='{{.Created}}' 2>/dev/null || echo "")

echo "  Image: $CURRENT_IMAGE"
if [ -n "$CURRENT_CREATED" ]; then
    echo "  Started: $CURRENT_CREATED"
fi
echo ""

# ===================================
# 5. 롤백 예시
# ===================================
echo -e "${YELLOW}🔄 Rollback example:${NC}"
echo "  bash rollback.sh main-frontend-abc123"
echo "  bash rollback.sh main-frontend-20241205-143022"
echo "  bash rollback.sh latest"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

