#!/bin/bash
# Runs on EC2 frontend instances via SSM.
# Requires NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL env vars set by the caller.
set -euo pipefail

APP_DIR="/home/appuser/app"
FRONTEND_DIR="$APP_DIR/frontend"
REGION="${AWS_DEFAULT_REGION:-ap-southeast-1}"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

# --- First-time clone ---
if [ ! -d "$APP_DIR/.git" ]; then
  REPO_URL=$(aws ssm get-parameter \
    --name "/blog-prod/backend/github_repo_url" \
    --region "$REGION" --query Value --output text)
  log "Cloning $REPO_URL"
  sudo -u appuser git clone "$REPO_URL" "$APP_DIR"
fi

# --- Pull latest ---
log "Pulling latest code"
sudo -u appuser git -C "$APP_DIR" pull origin main

# --- Install deps ---
log "Installing Node.js dependencies"
sudo -u appuser bash -c "cd $FRONTEND_DIR && pnpm install --frozen-lockfile"

# --- Build ---
log "Building Next.js (NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL)"
sudo -E -u appuser bash -c "
  cd $FRONTEND_DIR
  NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
  NEXT_PUBLIC_SITE_NAME='Travel Blog' \
  pnpm build
"

# --- Restart services ---
log "Restarting services"
systemctl restart travel-blog-web
sleep 3
systemctl is-active travel-blog-web
systemctl reload nginx
log "Frontend deploy complete"
