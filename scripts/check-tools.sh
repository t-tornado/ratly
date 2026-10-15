#!/usr/bin/env bash
set -euo pipefail

failed=0

check() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "MISSING: $1 — $2"
    failed=1
  else
    echo "OK: $1"
  fi
}

check "pnpm" "Install: npm i -g pnpm"
check "gitleaks" "Install: brew install gitleaks (macOS) / choco install gitleaks (Windows) / https://github.com/gitleaks/gitleaks#installing"
check "node" "Install: https://nodejs.org"

if [ "$failed" -eq 1 ]; then
  echo ""
  echo "Setup cannot continue. Install missing tools above."
  exit 1
fi

echo ""
echo "All tools found."
