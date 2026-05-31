# Travel Blog

A full-stack travel blog with Next.js 14 (frontend) and FastAPI (backend), deployed to AWS via Terraform.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router · TypeScript · Tailwind CSS |
| Backend | Python 3.12 · FastAPI · SQLAlchemy 2.x (async) |
| Database | PostgreSQL 16 |
| Auth | JWT (access token 1h + refresh token 7d) |
| Storage | AWS S3 (post images & avatars) |
| Infra | Terraform · AWS S3 + CloudFront + ECS Fargate |

## Project Structure

```
travel-blog/
├── backend/                    # FastAPI service
│   ├── app/
│   │   ├── main.py             # App entry point, CORS, router registration
│   │   ├── core/
│   │   │   ├── config.py       # Settings (pydantic-settings, reads .env)
│   │   │   ├── security.py     # JWT creation/decode, bcrypt helpers
│   │   │   └── dependencies.py # get_db, get_current_user, require_role()
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic v2 request/response schemas
│   │   ├── repositories/       # Raw DB queries (AsyncSession)
│   │   ├── services/           # Business logic layer
│   │   └── api/v1/             # FastAPI routers
│   ├── alembic/                # Database migrations
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   ├── tests/
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # Next.js 14 app
│   ├── app/
│   │   ├── (blog)/             # Public routes (posts, search)
│   │   ├── (auth)/             # Login, register
│   │   └── (author)/           # Protected author routes
│   ├── components/
│   │   ├── ui/                 # Generic primitives (Button, Input)
│   │   ├── blog/               # Blog-specific (PostCard, SearchBar)
│   │   ├── auth/               # LoginForm, RegisterForm
│   │   ├── author/             # PostEditorPage
│   │   └── layout/             # Header, Footer
│   ├── hooks/                  # TanStack Query hooks
│   ├── lib/
│   │   ├── api.ts              # Axios instance + silent token refresh
│   │   └── utils.ts            # cn(), formatDate(), readingTime()
│   ├── store/
│   │   └── authStore.ts        # Zustand auth state
│   ├── types/                  # TypeScript interfaces (mirrors backend schemas)
│   ├── package.json
│   └── .env.example
│
├── terraform/                  # AWS infrastructure (Terraform)
│   ├── main.tf                 # Provider, S3 backend, module calls
│   ├── variables.tf            # All input variables
│   ├── outputs.tf              # CloudFront URL, ALB DNS, ECR URL, RDS endpoint
│   ├── terraform.tfvars.example
│   └── modules/
│       ├── networking/         # VPC, subnets, security groups
│       ├── s3/                 # Frontend bucket + images bucket
│       ├── cloudfront/         # CDN (OAC, SPA routing, /api/* → ALB)
│       ├── ecr/                # Docker image registry
│       ├── alb/                # Application Load Balancer
│       ├── rds/                # PostgreSQL 16
│       ├── ecs/                # Fargate service + auto-scaling
│       └── dns/                # Route53 (optional)
├── docker-compose.yml          # Local dev: postgres + backend + frontend
└── README.md
```

## Database Schema

```
users
  id · username · email · hashed_password · display_name
  bio · avatar_url · role (MEMBER | AUTHOR) · is_active

posts
  id · slug · title · content · description · location
  cover_image · status (DRAFT | PUBLISHED) · view_count
  is_deleted · published_at · author_id → users

tags                post_tags (post_id, tag_id)

favorites           follows
  user_id → users     follower_id → users
  post_id → posts     following_id → users

refresh_tokens
  token_hash (SHA-256) · user_id → users · expires_at · is_revoked
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Register new account |
| POST | `/api/v1/auth/login` | — | Login, returns JWT pair |
| POST | `/api/v1/auth/refresh` | — | Refresh access token |
| POST | `/api/v1/auth/logout` | — | Revoke refresh token |
| GET | `/api/v1/posts` | — | List published posts |
| GET | `/api/v1/posts/{slug}` | — | Post detail |
| GET | `/api/v1/search?q=` | — | Search posts |
| GET | `/api/v1/users/me` | Member | My profile |
| PUT | `/api/v1/users/me` | Member | Update profile |
| POST | `/api/v1/users/me/avatar` | Member | Upload avatar |
| PUT | `/api/v1/users/me/password` | Member | Change password |
| GET | `/api/v1/users/me/favorites` | Member | Saved posts |
| POST | `/api/v1/users/me/favorites/{slug}` | Member | Add favorite |
| DELETE | `/api/v1/users/me/favorites/{slug}` | Member | Remove favorite |
| POST | `/api/v1/users/me/following/{username}` | Member | Follow author |
| DELETE | `/api/v1/users/me/following/{username}` | Member | Unfollow |
| GET | `/api/v1/users/me/feed` | Member | Feed from followed authors |
| GET | `/api/v1/author/posts` | Author | My posts (draft + published) |
| POST | `/api/v1/author/posts` | Author | Create post |
| PUT | `/api/v1/author/posts/{slug}` | Author | Edit own post |
| DELETE | `/api/v1/author/posts/{slug}` | Author | Soft-delete own post |
| POST | `/api/v1/uploads/image` | Author | Upload post image → S3 URL |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for running frontend outside Docker)
- Python 3.12+ with [uv](https://docs.astral.sh/uv/) (for running backend outside Docker)

---

### Option A — Docker Compose (Recommended)

Runs Postgres + Backend + Frontend in one command.

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd travel-blog

# 2. Create backend environment file
cp backend/.env.example backend/.env
# Edit backend/.env — set a real SECRET_KEY (see tip below)

# 3. Create frontend environment file
cp frontend/.env.example frontend/.env.local

# 4. Start all services
docker-compose up --build

# 5. In a separate terminal, run the database migration
docker-compose exec backend uv run alembic upgrade head
```

Services will be available at:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API Docs (Swagger) → http://localhost:8000/docs
- Postgres → localhost:5432 (user: `blog`, password: `blog`, db: `travel_blog`)

> **Tip — generate a secure SECRET_KEY:**
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(32))"
> ```

---

### Option B — Manual Setup (Without Docker)

#### 1. Start PostgreSQL

```bash
# Using Docker for just the database
docker run -d \
  --name travel-blog-db \
  -e POSTGRES_USER=blog \
  -e POSTGRES_PASSWORD=blog \
  -e POSTGRES_DB=travel_blog \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 2. Backend

```bash
cd backend

# Install dependencies (uv creates a virtualenv automatically)
uv sync

# Copy and configure environment
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY

# Run database migrations
uv run alembic upgrade head

# Start the development server (auto-reload enabled)
uv run fastapi dev app/main.py
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

#### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local

# Start the development server
npm run dev
# → http://localhost:3000
```

---

## Development Workflow

### Backend commands

```bash
# Run all tests
uv run pytest

# Run only unit tests
uv run pytest tests/unit/

# Run with coverage report
uv run pytest --cov=app --cov-report=term-missing

# Create a new migration after changing models
uv run alembic revision --autogenerate -m "describe the change"

# Apply migrations
uv run alembic upgrade head

# Rollback last migration
uv run alembic downgrade -1

# Type check
uv run pyright app/
```

### Frontend commands

```bash
# Type check (no emit)
npm run type-check

# Lint
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Production build
npm run build
```

---

## User Roles

| Role | Permissions |
|---|---|
| **Guest** | Browse posts, search, view post detail, register |
| **Member** | All Guest permissions + login/logout, update profile, save favorites, follow authors |
| **Author** | All Member permissions + create/edit/delete own posts, upload images |

A new account always starts as **Member**. To become an **Author**, the role must be updated manually in the database (or via an admin endpoint you add later):

```sql
UPDATE users SET role = 'AUTHOR' WHERE email = 'your@email.com';
```

---

## Environment Variables Reference

### `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | Yes | — | Random string for JWT signing (min 32 chars) |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token TTL |
| `AWS_REGION` | No | `ap-southeast-1` | AWS region for S3 |
| `AWS_S3_BUCKET` | No | — | S3 bucket name for image uploads |
| `AWS_ACCESS_KEY_ID` | No | — | AWS credentials (optional if using IAM role) |
| `AWS_SECRET_ACCESS_KEY` | No | — | AWS credentials |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | CORS allowed origins |

### `frontend/.env.local`

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public site URL (for OG tags) |
| `NEXT_PUBLIC_SITE_NAME` | No | `Travel Blog` | Site name |

---

## Stopping & Cleaning Up

```bash
# Stop all Docker services
docker-compose down

# Stop and remove database volume (deletes all data)
docker-compose down -v
```

---

## Deploy to AWS (Terraform)

### Architecture

```
Internet
   │
   ├──► CloudFront ──► S3 bucket  (Next.js static files)
   │         │
   │         └──► ALB (port 80) ──► EC2 t3.micro  (FastAPI :8000)
   │                                      │
   │                               RDS PostgreSQL  (private subnet)
   │                               S3 images bucket
   │
   └──► SSM Session Manager (SSH-less access to EC2)
```

**Modules:**

| Module | Resources |
|---|---|
| `networking` | VPC, 2 public + 2 private subnets, IGW, NAT, security groups |
| `s3` | Frontend bucket (OAC) + images bucket (CORS) |
| `cloudfront` | CDN: S3 default, `/api/*` → ALB |
| `alb` | Internet-facing ALB, target group, HTTP listener |
| `ec2` | Amazon Linux 2023, Elastic IP, IAM profile, systemd service |
| `rds` | PostgreSQL 16, private subnet, encrypted |
| `dns` | Route53 A records (optional) |

---

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) v2 configured (`aws configure`)
- No Docker required — backend runs directly on EC2 with Python + uv

---

### Step 1 — Bootstrap Terraform state storage

Run once before the first `terraform init`. Terraform keeps its state in S3 and uses DynamoDB to prevent concurrent applies.

```bash
# Create state bucket (name must be globally unique — change if taken)
aws s3 mb s3://travel-blog-tfstate --region ap-southeast-1

# Create lock table
aws dynamodb create-table \
  --table-name travel-blog-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

---

### Step 2 — Configure variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Open `terraform.tfvars` and set these values:

| Variable | Required | Example / Notes |
|---|---|---|
| `db_password` | **Yes** | Strong password ≥ 16 chars |
| `secret_key` | **Yes** | `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `ec2_key_name` | No | Name of an existing EC2 Key Pair (for SSH). Leave `""` to use SSM only. |
| `domain_name` | No | `myblog.com` — leave `""` if no domain yet |
| `create_dns_records` | No | `true` only if domain is in Route53 |

---

### Step 3 — Init and apply

```bash
terraform init
terraform plan  -var-file=terraform.tfvars   # review everything before creating
terraform apply -var-file=terraform.tfvars   # type "yes" to confirm
```

First apply takes ~8–12 minutes (RDS takes longest). When done, note the outputs:

```
frontend_url      = "https://d1234abcd.cloudfront.net"
api_url           = "http://travel-blog-prod-alb-xxx.ap-southeast-1.elb.amazonaws.com"
ec2_instance_id   = "i-0abc123def456"
ec2_public_ip     = "13.xx.xx.xx"
rds_endpoint      = <sensitive>
```

```bash
# View the sensitive RDS endpoint
terraform output rds_endpoint
```

---

### Step 4 — Deploy backend code to EC2

Terraform bootstraps the EC2 instance (installs Python 3.12, uv, creates the systemd service, writes `/home/appuser/app/.env`). You only need to copy the code and start the service.

```bash
INSTANCE_ID=$(terraform output -raw ec2_instance_id)
EC2_IP=$(terraform output -raw ec2_public_ip)

# Option A — SSM Session Manager (no key pair needed, requires SSM agent — included in AL2023)
aws ssm start-session --target $INSTANCE_ID --region ap-southeast-1

# Option B — SSH (only if ec2_key_name was set)
ssh -i ~/.ssh/your-key.pem ec2-user@$EC2_IP
```

Once connected to the instance:

```bash
# Switch to app user
sudo -i -u appuser

# Clone the backend code
git clone <your-repo-url> /home/appuser/app
cd /home/appuser/app/backend

# Install dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Start (and enable) the systemd service
sudo systemctl enable travel-blog-api
sudo systemctl start  travel-blog-api
sudo systemctl status travel-blog-api   # should show "active (running)"
```

Verify the backend is reachable through the ALB:

```bash
API_URL=$(terraform -chdir=../terraform output -raw api_url)
curl $API_URL/health
# → {"status":"ok"}
```

---

### Step 5 — Deploy frontend

Build Next.js as a static export and upload to S3:

```bash
cd frontend

# Point the frontend at the ALB
API_URL=$(terraform -chdir=../terraform output -raw api_url)
echo "NEXT_PUBLIC_API_URL=http://$API_URL" > .env.production

# Add static export to next.config.js (required for S3 hosting)
# In next.config.js, add:  output: 'export'

# Build
npm run build          # generates the `out/` directory

# Upload to S3
BUCKET=$(terraform -chdir=../terraform output -raw frontend_bucket_id)
aws s3 sync out/ s3://$BUCKET/ --delete --region ap-southeast-1

# Invalidate CloudFront cache so visitors see the new version immediately
DIST_ID=$(terraform -chdir=../terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

Open `terraform output frontend_url` in a browser — the site should be live.

---

### Redeploying after code changes

**Backend only** (no infrastructure change):

```bash
# SSH / SSM into the instance, then:
cd /home/appuser/app/backend
git pull
uv sync
uv run alembic upgrade head          # only if models changed
sudo systemctl restart travel-blog-api
```

**Frontend only:**

```bash
cd frontend
npm run build
BUCKET=$(terraform -chdir=../terraform output -raw frontend_bucket_id)
aws s3 sync out/ s3://$BUCKET/ --delete --region ap-southeast-1
DIST_ID=$(terraform -chdir=../terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

**Infrastructure change:**

```bash
cd terraform
terraform plan  -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

---

### Tearing down

```bash
cd terraform

# Remove all AWS resources (RDS data will be lost — back up first if needed)
terraform destroy -var-file=terraform.tfvars

# Clean up state storage (optional — only if you're done entirely)
aws s3 rb s3://travel-blog-tfstate --force
aws dynamodb delete-table --table-name travel-blog-tflock --region ap-southeast-1
```

---

### Cost estimate (ap-southeast-1, minimal config)

| Resource | Spec | Est. monthly |
|---|---|---|
| EC2 | `t3.micro` (backend) | ~$8 |
| RDS | `db.t3.micro` PostgreSQL, single-AZ | ~$15 |
| ALB | 1 LCU baseline | ~$18 |
| NAT Gateway | 1 (for RDS private subnet outbound) | ~$35 |
| CloudFront | 10 GB transfer + 1M requests | ~$2 |
| S3 (2 buckets) | 5 GB storage | ~$1 |
| Elastic IP | 1 (attached, free while running) | $0 |
| **Total** | | **~$79/month** |

> **Tip — reduce cost for dev/learning:**
> - Use `db.t3.micro` (already the default)
> - Remove the NAT Gateway and put RDS in a public subnet (`associate_public_ip_address = true` on RDS) — only do this for non-production
> - Stop the EC2 and RDS instances when not in use (stop ≠ terminate — data is preserved)
