#!/bin/bash
set -e

# ── System setup ─────────────────────────────────────────────────────────────
dnf update -y
dnf install -y python3.12 python3.12-pip git

# ── Install uv ───────────────────────────────────────────────────────────────
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# ── Create app user ───────────────────────────────────────────────────────────
useradd -m -s /bin/bash appuser

# ── Write .env file ───────────────────────────────────────────────────────────
mkdir -p /home/appuser/app
cat > /home/appuser/app/.env << 'ENVEOF'
DATABASE_URL=postgresql+asyncpg://${db_username}:${db_password}@${rds_endpoint}/${db_name}
SECRET_KEY=${secret_key}
AWS_REGION=${aws_region}
AWS_S3_BUCKET=${images_bucket_name}
ALLOWED_ORIGINS=https://${cloudfront_domain}
ENVEOF

chown -R appuser:appuser /home/appuser/app

# ── Systemd service (code is deployed after terraform via deploy.sh) ──────────
cat > /etc/systemd/system/travel-blog-api.service << 'EOF'
[Unit]
Description=Travel Blog FastAPI
After=network.target

[Service]
User=appuser
WorkingDirectory=/home/appuser/app
ExecStart=/home/appuser/.local/bin/uv run fastapi run app/main.py --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
EnvironmentFile=/home/appuser/app/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
# Service starts after code is deployed via deploy.sh
