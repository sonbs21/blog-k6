#!/bin/bash
# Runs on EC2 backend instances via SSM. Reads env vars from SSM Parameter Store.
set -euo pipefail

APP_DIR="/home/appuser/app"
BACKEND_DIR="$APP_DIR/backend"
PARAM_PREFIX="/blog-prod/backend"
REGION="${AWS_DEFAULT_REGION:-ap-southeast-1}"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

# --- First-time clone ---
if [ ! -d "$APP_DIR/.git" ]; then
  REPO_URL=$(aws ssm get-parameter \
    --name "$PARAM_PREFIX/github_repo_url" \
    --region "$REGION" --query Value --output text)
  log "Cloning $REPO_URL"
  sudo -u appuser git clone "$REPO_URL" "$APP_DIR"
fi

# --- Pull latest ---
log "Pulling latest code"
sudo -u appuser git -C "$APP_DIR" pull origin main

# --- Rebuild .env from SSM ---
log "Writing .env from SSM Parameter Store"
DB_URL=$(aws ssm get-parameter --name "$PARAM_PREFIX/DATABASE_URL" \
  --with-decryption --region "$REGION" --query Value --output text)
SECRET_KEY=$(aws ssm get-parameter --name "$PARAM_PREFIX/SECRET_KEY" \
  --with-decryption --region "$REGION" --query Value --output text)
S3_BUCKET=$(aws ssm get-parameter --name "$PARAM_PREFIX/AWS_S3_BUCKET" \
  --region "$REGION" --query Value --output text)
ALLOWED_ORIGINS=$(aws ssm get-parameter --name "$PARAM_PREFIX/ALLOWED_ORIGINS" \
  --region "$REGION" --query Value --output text)

cat > /tmp/backend.env << ENVEOF
DATABASE_URL=${DB_URL}
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
AWS_REGION=${REGION}
AWS_S3_BUCKET=${S3_BUCKET}
ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
ENVEOF

mv /tmp/backend.env "$BACKEND_DIR/.env"
chown appuser:appuser "$BACKEND_DIR/.env"
chmod 600 "$BACKEND_DIR/.env"

# --- Install deps ---
log "Installing Python dependencies"
sudo -u appuser bash -c "cd $BACKEND_DIR && /usr/local/bin/uv sync"

# --- Migrations ---
log "Running database migrations"
sudo -u appuser bash -c "cd $BACKEND_DIR && /usr/local/bin/uv run alembic upgrade head"

# --- Restart service ---
log "Restarting service"
systemctl restart travel-blog-api
sleep 3
systemctl is-active travel-blog-api
log "Backend deploy complete"
