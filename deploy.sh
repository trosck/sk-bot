#!/usr/bin/env bash
set -euo pipefail

npm run migrate:deploy

npm run prisma:generate

npm run build:clean

pm2 reload bot
pm2 reset bot

pm2 reload api
pm2 reset api
