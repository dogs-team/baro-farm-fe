#!/bin/sh
#
# Git hooks 설치 스크립트
#

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "🔧 Git hooks 설치 중..."

# pre-commit hook 설치
if [ -f "$SCRIPT_DIR/pre-commit" ]; then
    cp "$SCRIPT_DIR/pre-commit" "$GIT_HOOKS_DIR/pre-commit"
    chmod +x "$GIT_HOOKS_DIR/pre-commit"
    echo "✅ pre-commit hook 설치 완료!"
else
    echo "⚠️  pre-commit hook 파일을 찾을 수 없습니다."
    echo "   $SCRIPT_DIR/pre-commit"
fi

echo ""
echo "이제 커밋할 때마다 자동으로 코드 품질 검사가 실행됩니다."
echo ""
echo "수동 검사 명령어:"
echo "  pnpm lint          # ESLint 검사"
echo "  pnpm lint:fix      # ESLint 자동 수정"
echo "  pnpm format        # Prettier 포맷팅"
echo "  pnpm format:check  # Prettier 검사만"

