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
MAIN_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}/${SERVICE_NAME}:main"

echo "🚀 Deploying frontend..."
echo "📦 Image: ${FULL_IMAGE_NAME}"
echo "🏷️  Tag: ${IMAGE_TAG}"

# USER 환경 변수 확인 (없으면 현재 사용자 사용)
if [ -z "$USER" ]; then
  USER=$(whoami)
fi

# 작업 디렉토리 설정
DEPLOY_DIR="/home/${USER}/apps/FE"
mkdir -p ${DEPLOY_DIR}
cd ${DEPLOY_DIR}

# .env 파일 생성 (Nginx 사용 시)
if [ ! -f ".env" ]; then
  echo "📝 Creating .env file for Nginx configuration..."
  cat > .env <<EOF
# Nginx 프록시 사용 시 rewrites 비활성화
NEXT_PUBLIC_USE_API_REWRITES=false
# API Gateway URL (Nginx가 프록시하므로 상대 경로 사용 가능)
NEXT_PUBLIC_API_GATEWAY_URL=http://3.34.14.73
NEXT_PUBLIC_API_BASE_URL=http://3.34.14.73
EOF
  echo "✅ .env file created"
fi

# .env 옵션 (있으면 --env-file .env 추가)
COMPOSE_ENV_FILE=""
if [ -f ".env" ]; then
  COMPOSE_ENV_FILE="--env-file .env"
  echo "ℹ️  Using env file: ${DEPLOY_DIR}/.env"
fi

# Docker 로그인
echo "🔐 Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ${REGISTRY} -u do-develop-space --password-stdin

# Docker Compose 명령어 확인 (v1 또는 v2)
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  echo "❌ docker-compose or docker compose not found"
  exit 1
fi

# 레지스트리 이미지 우선 Pull
echo "📥 Pulling image from registry (branch tag → main fallback)..."
IMAGE_TO_USE=""
if docker pull ${FULL_IMAGE_NAME} 2>/dev/null; then
  echo "✅ Pulled ${FULL_IMAGE_NAME}"
  IMAGE_TO_USE=${FULL_IMAGE_NAME}
elif docker pull ${MAIN_IMAGE_NAME} 2>/dev/null; then
  echo "✅ Pulled ${MAIN_IMAGE_NAME}"
  IMAGE_TO_USE=${MAIN_IMAGE_NAME}
else
  echo "⚠️  Registry image not found. Will build locally."
fi

# override 파일 구성 (레지스트리 이미지가 있는 경우)
# frontend만 override하고 nginx는 그대로 유지
OVERRIDE_FILE=""
COMPOSE_FILES="-f docker-compose.yml"
if [ -n "$IMAGE_TO_USE" ]; then
  OVERRIDE_FILE="/tmp/frontend-image-override.yml"
  cat > ${OVERRIDE_FILE} <<EOF
services:
  frontend:
    image: ${IMAGE_TO_USE}
  # nginx는 docker-compose.yml의 설정 그대로 사용
EOF
  COMPOSE_FILES="${COMPOSE_FILES} -f ${OVERRIDE_FILE}"
fi

# 기존 컨테이너 중지 및 제거
echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} down || true

if [ -n "$IMAGE_TO_USE" ]; then
  echo "🚀 Starting containers with pulled image (force recreate)..."
  $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} up -d --force-recreate --pull missing
else
  echo "🏗️  Building images with env file (no registry image found)..."
  $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} build --pull || true
  echo "🚀 Starting containers (force recreate)..."
  $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} up -d --force-recreate
fi

# 헬스 체크
echo "🏥 Health check..."
sleep 10

# 컨테이너 상태 확인
if $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} ps | grep -q "Up"; then
  echo "✅ Frontend deployed successfully!"
  $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} ps
  
  # Nginx 컨테이너 확인
  if docker ps | grep -q "barofarm-nginx"; then
    echo "✅ Nginx container is running"
    $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} logs --tail=10 nginx
  else
    echo "⚠️  Nginx container is not running"
  fi
  
  $DOCKER_COMPOSE ${COMPOSE_ENV_FILE} ${COMPOSE_FILES} logs --tail=20 frontend
  
  # 배포 이력 기록
  DEPLOYED_IMAGE=$(docker inspect ${SERVICE_NAME} --format='{{.Config.Image}}' 2>/dev/null || echo "unknown")
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy: frontend to ${DEPLOYED_IMAGE} (tag: ${IMAGE_TAG})" >> ~/apps/FE/deployment-history.log
else
  echo "❌ Deployment failed!"
  $DOCKER_COMPOSE ps
  $DOCKER_COMPOSE logs frontend
  exit 1
fi

echo "✨ Deployment completed!"

