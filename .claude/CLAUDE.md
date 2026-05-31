# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A travel blog built with Next.js 14 (App Router) and TypeScript, with MDX-based content authoring.
Infrastructure is managed with Terraform and deployed to AWS (S3 + CloudFront static export).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 — App Router + TypeScript 5.x strict mode |
| Styling | Tailwind CSS v3 |
| Content | MDX files in `content/posts/` via `next-mdx-remote` |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2.x (async) |
| Database | PostgreSQL (asyncpg) + Alembic migrations |
| Auth | JWT — python-jose + passlib[bcrypt] |
| Storage | AWS S3 (post images via boto3) |
| Infra | Terraform 1.x |
| Hosting | Frontend → S3 + CloudFront \| Backend → ECS Fargate + ALB |
| CI/CD | GitHub Actions |

## Project Structure

```
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── (blog)/
│   │   │   ├── posts/[slug]/page.tsx
│   │   │   └── posts/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                      # Primitive components
│   │   └── blog/                    # Blog-specific components
│   ├── content/posts/               # MDX files (slug.mdx)
│   ├── lib/
│   │   ├── api.ts                   # Axios instance + interceptors
│   │   ├── mdx.ts                   # MDX parsing helpers
│   │   └── utils.ts                 # cn(), formatDate()
│   ├── hooks/                       # TanStack Query hooks
│   ├── types/                       # Shared TS interfaces
│   ├── public/images/posts/         # Static post images
│   ├── next.config.js
│   └── tailwind.config.ts
│
├── backend/                         # FastAPI service
│   ├── app/
│   │   ├── main.py
│   │   ├── core/                    # config, security, dependencies
│   │   ├── api/v1/                  # route handlers
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── services/                # Business logic
│   │   └── repositories/           # DB queries
│   ├── alembic/
│   ├── tests/
│   └── pyproject.toml
│
└── terraform/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── modules/
        ├── s3/                      # Frontend static hosting
        ├── cloudfront/              # CDN
        ├── ecs/                     # Backend Fargate service
        ├── rds/                     # PostgreSQL
        └── dns/
```

## Commands

```bash
# --- Frontend (run from frontend/) ---
npm run dev          # Dev server → localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run test         # Vitest
npm run test:watch   # Vitest watch mode

# --- Backend (run from backend/) ---
uv run fastapi dev app/main.py          # Dev server → localhost:8000 (with --reload)
uv run pytest                           # Run all tests
uv run pytest tests/unit/               # Unit tests only
uv run pytest tests/integration/        # Integration tests only
uv run alembic upgrade head             # Apply migrations
uv run alembic revision --autogenerate -m "description"  # New migration

# --- Terraform (run from terraform/) ---
terraform init
terraform fmt && terraform validate
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars   # Requires manual confirmation
```

## Key Conventions

- **Posts**: MDX files in `content/posts/{slug}.mdx` with frontmatter: `title`, `date`, `description`, `tags`, `coverImage`, `location`
- **Images**: Stored in `public/images/posts/{slug}/`. Reference in MDX as `/images/posts/{slug}/filename.jpg`
- **Components**: PascalCase filenames. Barrel exports via `index.ts` in each folder
- **Data fetching**: All fetching in Server Components. Client Components only for interactivity
- **Tailwind**: Use `cn()` from `lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- **Types**: Shared interfaces in `types/` — `Post`, `PostMeta`, `Author`

## MDX Frontmatter Schema

```yaml
---
title: "Post Title"
date: "2026-01-15"
description: "One-sentence summary for SEO and cards"
tags: ["travel", "asia"]
location: "Hanoi, Vietnam"
coverImage: "/images/posts/slug/cover.jpg"
draft: false
---
```

## Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME="Travel Blog"
NEXT_PUBLIC_API_URL=http://localhost:8000   # dev | https://api.yourdomain.com in prod

# backend/.env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/travel_blog
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=travel-blog-images
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# CI / Terraform only
S3_BUCKET_NAME=travel-blog-prod-site
CLOUDFRONT_DISTRIBUTION_ID=XXXXXX
```

## Agent and Skill Reference

- **Agents** (`.claude/agents/`): sub-agents for specialized work. Claude spawns them automatically, or you can ask explicitly: *"use the backend agent to..."*
  - `frontend` — Next.js 14 UI, React components, Tailwind
  - `backend` — FastAPI, SQLAlchemy, Pydantic, migrations
  - `infra` — Terraform, AWS, CI/CD

- **Commands** (`.claude/commands/`): slash commands for common tasks
  - `/guest:post-list`, `/guest:search`, `/guest:register`
  - `/member:auth`, `/member:favorites`, `/member:profile`
  - `/author:create-post`, `/author:manage-posts`
  - `/new-component`, `/new-post`, `/deploy`

- **Skills** (`.claude/skills/`): reference patterns read as context
  - `.claude/skills/nextjs-patterns.md`
  - `.claude/skills/terraform-aws.md`
