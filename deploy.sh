#!/bin/bash
set -e

echo "=== Prime Smile Deploy Script ==="

# Config
APP_DIR="/var/www/prime-dental-smile-labs"
REPO_URL="https://github.com/mindspire-org/Prime-dental-smile-labs.git"
BRANCH="main"

# If APP_DIR doesn't exist, clone the repo
if [ ! -d "$APP_DIR" ]; then
  echo "App directory not found. Cloning repo..."
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

echo "Pulling latest code..."
git pull origin "$BRANCH"

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Restarting server..."
if command -v pm2 &> /dev/null; then
  pm2 restart server || pm2 start server.mjs --name "prime-smile"
elif command -v systemctl &> /dev/null; then
  systemctl restart prime-smile || echo "systemctl service 'prime-smile' not found. Start manually: node server.mjs"
else
  echo "No process manager found. Start manually: node server.mjs"
fi

echo ""
echo "=== Deploy complete ==="
echo "Check server logs for startup validation output."
