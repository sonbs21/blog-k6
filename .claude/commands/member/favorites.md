Implement favorites and author-follow features for authenticated members.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.
All endpoints require `Authorization: Bearer {access_token}`.

---

## Backend — FastAPI (`backend/`)

**Favorite endpoints:**
- `POST   /api/v1/posts/{slug}/favorite`   — add favorite
- `DELETE /api/v1/posts/{slug}/favorite`   — remove favorite
- `GET    /api/v1/users/me/favorites`      — list saved posts

**Follow endpoints:**
- `POST   /api/v1/users/{username}/follow`   — follow an author
- `DELETE /api/v1/users/{username}/follow`   — unfollow
- `GET    /api/v1/users/me/following`        — list followed authors
- `GET    /api/v1/users/me/feed`             — posts from followed authors (paginated)

1. **Models**
   ```python
   class Favorite(Base):
       __tablename__ = "favorites"
       user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
       post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id"), primary_key=True)
       created_at: Mapped[datetime] = mapped_column(default=func.now())

   class Follow(Base):
       __tablename__ = "follows"
       follower_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
       following_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
       created_at: Mapped[datetime] = mapped_column(default=func.now())
   ```

2. **Toggle pattern** (favorite and follow share the same logic)
   - `POST`: insert row, ignore if already exists (`INSERT ... ON CONFLICT DO NOTHING`)
   - `DELETE`: delete row, return 204 even if row didn't exist (idempotent)

3. **Feed** (`GET /users/me/feed`)
   - Join `follows` → `posts` where `posts.author_id IN (following_ids)` and `status = PUBLISHED`
   - Paginate by `published_at DESC`
   - Return `PostListItem[]`

4. **Response enrichment** — on `GET /posts/{slug}`, include:
   - `is_favorited: bool` (requires current user — optional field, null if unauthenticated)
   - `favorite_count: int`

---

## Frontend — Next.js (`frontend/`)

1. **FavoriteButton** (`components/blog/FavoriteButton.tsx`) — `"use client"`
   - Heart icon, filled/outline based on `is_favorited`
   - Optimistic update via `useMutation` + `queryClient.setQueryData`
   - Hidden (or disabled with tooltip) when user is not authenticated

2. **FollowButton** (`components/blog/FollowButton.tsx`) — `"use client"`
   - "Follow" / "Following" toggle on author cards and post detail page
   - Same optimistic update pattern

3. **Saved posts page** (`app/(member)/saved/page.tsx`)
   - Fetch `GET /api/v1/users/me/favorites`
   - Same `PostCard` grid as post listing

4. **Feed page** (`app/(member)/feed/page.tsx`)
   - Fetch `GET /api/v1/users/me/feed`
   - Empty state: "Follow some authors to see their posts here"

5. **Hooks**
   - `useFavoritePost(slug)` — toggle mutation + invalidates post detail query
   - `useFollowUser(username)` — toggle mutation + invalidates following list
