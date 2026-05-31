Implement post listing and post detail pages for the travel blog. No authentication required.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.

---

## Backend — FastAPI (`backend/`)

**Endpoints:**
- `GET /api/v1/posts?page=1&limit=12&tag=&location=` — paginated list
- `GET /api/v1/posts/{slug}` — post detail

1. **Post model** (`app/models/post.py`)
   - Fields: `id`, `slug` (unique), `title`, `description`, `content`, `location`, `cover_image`, `status` (DRAFT/PUBLISHED), `author_id`, `published_at`, `created_at`, `updated_at`
   - Relationship: `author` → User, `tags` → many-to-many Tag

2. **Schemas** (`app/schemas/post.py`)
   - `PostListItem` — lightweight (no content field) for listing
   - `PostDetail` — full content + author info + tags
   - Both include `view_count`, `favorite_count`

3. **Repository** (`app/repositories/post_repository.py`)
   - `get_published_list(page, limit, tag, location)` — filter by `status = PUBLISHED`
   - `get_by_slug(slug)` — raise 404 if not found or not PUBLISHED
   - Increment `view_count` on `get_by_slug` (fire-and-forget, no await needed)

4. **Router** (`app/api/v1/posts.py`) — no auth on these two endpoints

---

## Frontend — Next.js (`frontend/`)

**Post listing** (`app/(blog)/posts/page.tsx`) — Server Component
- Fetch from `GET /api/v1/posts` at request time (no `generateStaticParams` needed)
- Render `PostCard` grid, 12 per page
- Filter chips for tag and location
- Pagination component at bottom
- `generateMetadata` → title "All Posts | Travel Blog"

**Post detail** (`app/(blog)/posts/[slug]/page.tsx`) — Server Component
- Fetch from `GET /api/v1/posts/{slug}`
- Render: cover image (full-width hero), title, meta bar (location, date, read time, views)
- Render content as MDX via `next-mdx-remote` or HTML (depending on storage format)
- Author card at bottom with avatar, name, bio, follow button (client island)
- Related posts section (same tags/location — separate API call)
- `generateMetadata` → title, description, OG image from `cover_image`
