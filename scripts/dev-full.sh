#!/usr/bin/env bash
set -e

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $SERVER_PID $UI_PID 2>/dev/null || true
  wait $SERVER_PID $UI_PID 2>/dev/null || true
  echo "Done."
}
trap cleanup EXIT INT TERM

echo "Starting Redis..."
docker compose up redis redis-test -d --wait

echo "Starting server..."
pnpm dev:server &
SERVER_PID=$!

echo "Waiting for server to be ready..."
until curl -sf http://localhost:3000/health > /dev/null 2>&1; do
  sleep 1
done
echo "Server ready on :3000"

echo "Starting UI..."
pnpm dev:ui &
UI_PID=$!
sleep 3
echo "UI ready on :5173"

echo "Starting load (steady)..."
pnpm --filter @ratly/load steady
