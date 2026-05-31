Implement edit and delete post features for the post owner (AUTHOR role).

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.
All endpoints require `Authorization: Bearer {access_token}` and ownership check.

---

## Backend — FastAPI (`backend/`)

**Endpoints:**
- `GET    /api/v1/author/posts`          — list own posts (DRAFT + PUBLISHED)
- `GET    /api/v1/author/posts/{slug}`   — get own post for editing
- `PUT    /api/v1/author/posts/{slug}`   — update post
- `DELETE /api/v1/author/posts/{slug}`   — soft delete

1. **Schemas** (`app/schemas/post.py`)
   ```python
   class PostUpdate(BaseModel):
       title: str | None = Field(None, min_length=5, max_length=255)
       content: str | None = None
       description: str | None = Field(None, max_length=160)
       location: str | None = None
       cover_image: str | None = None
       tags: list[str] | None = Field(None, max_length=5)
       status: Literal["DRAFT", "PUBLISHED"] | None = None

   class AuthorPostListItem(BaseModel):
       model_config = ConfigDict(from_attributes=True)
       id: uuid.UUID
       slug: str
       title: str
       status: str
       view_count: int
       favorite_count: int
       published_at: datetime | None
       updated_at: datetime
   ```

2. **Ownership check** (`app/services/post_service.py`)
   ```python
   async def get_own_post_or_403(slug: str, current_user: User, db: AsyncSession) -> Post:
       post = await post_repo.get_by_slug(slug, db)
       if post is None:
           raise HTTPException(404, "Post not found")
       if post.author_id != current_user.id:
           raise HTTPException(403, "Not the post owner")
       return post
   ```
   Call this in both PUT and DELETE handlers — never skip the ownership check.

3. **Soft delete** — set `is_deleted = True`, `deleted_at = now()`. Never `DELETE FROM posts`.
   - Add `is_deleted: Mapped[bool] = mapped_column(default=False)` to Post model
   - All public listing queries must filter `WHERE is_deleted = FALSE`

4. **Status transition** — when `status` changes to `PUBLISHED` and `published_at IS NULL`, set `published_at = now()`

---

## Frontend — Next.js (`frontend/`)

1. **My posts page** (`app/(author)/posts/page.tsx`) — `"use client"` for interactivity
   - Table/list: title, status badge (DRAFT=gray / PUBLISHED=green), views, favorites, date
   - Action buttons per row: Edit, Delete
   - Filter tabs: All | Published | Drafts

2. **Edit post page** (`app/(author)/posts/[slug]/edit/page.tsx`)
   - Re-uses `PostEditor` component (same as create)
   - Pre-fill all fields from `GET /api/v1/author/posts/{slug}`
   - Submit calls `PUT /api/v1/author/posts/{slug}`
   - Show "Last saved" timestamp

3. **Delete confirmation**
   - Click Delete → modal "Delete '{title}'? This cannot be undone."
   - Confirm → call `DELETE /api/v1/author/posts/{slug}` → remove from list with optimistic update

4. **Hooks**
   - `useAuthorPosts()` → `useQuery` on `GET /api/v1/author/posts`
   - `useUpdatePost(slug)` → `useMutation` on `PUT`, invalidates author posts + public post detail
   - `useDeletePost(slug)` → `useMutation` on `DELETE`, optimistically removes from list
