#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:?Usage: ./deploy.sh bot/api}"

git pull
npm run build
pm2 start dist/src/$APP_NAME.js --name $APP_NAME
