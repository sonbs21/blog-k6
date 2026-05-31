Implement the create new post feature for users with the AUTHOR role.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.
All endpoints require `Authorization: Bearer {access_token}` and role `AUTHOR`.

---

## Backend — FastAPI (`backend/`)

**Endpoints:**
- `POST /api/v1/posts`               — create post
- `POST /api/v1/uploads/image`       — upload image, returns URL

1. **Schemas** (`app/schemas/post.py`)
   ```python
   class PostCreate(BaseModel):
       title: str = Field(min_length=5, max_length=255)
       content: str = Field(min_length=10)   # HTML or Markdown string
       description: str = Field(max_length=160)
       location: str
       cover_image: str                       # S3 URL from upload endpoint
       tags: list[str] = Field(default=[], max_length=5)
       status: Literal["DRAFT", "PUBLISHED"] = "DRAFT"

   class PostResponse(BaseModel):
       model_config = ConfigDict(from_attributes=True)
       id: uuid.UUID
       slug: str
       title: str
       status: str
       author: AuthorInfo
       published_at: datetime | None
       created_at: datetime
   ```

2. **Slug generation** (`app/services/post_service.py`)
   - Derive from title: lowercase, strip diacritics, replace spaces with hyphens
   - Append `-2`, `-3` if slug already exists
   - Set `published_at = now()` if `status == PUBLISHED`, else `None`

3. **Image upload** (`app/api/v1/uploads.py`)
   - Accept `UploadFile`, validate: jpeg/png/webp/gif, max 5MB
   - Resize to max 1920px wide (use `Pillow`) before uploading
   - Upload to S3 at `posts/{author_id}/{uuid}.{ext}`
   - Return `{ "url": "https://cdn.yourdomain.com/posts/..." }`
   - Require role AUTHOR

4. **Auth guard** — use `Depends(require_role("AUTHOR"))` on both endpoints

---

## Frontend — Next.js (`frontend/`)

1. **New post page** (`app/(author)/posts/new/page.tsx`) — protected, AUTHOR role only

2. **PostEditor** (`components/author/PostEditor.tsx`) — `"use client"`
   - Rich text editor: use `@tiptap/react` with extensions: Bold, Italic, Heading, BulletList, Blockquote, Image
   - **Image insertion**: toolbar button → file picker → call `POST /api/v1/uploads/image` → insert returned URL into editor
   - Cover image: separate upload field above editor (drag-and-drop + click)
   - Fields: title, description (char counter 160), location, tags (tag input with max 5)
   - Status toggle: "Save Draft" / "Publish"

3. **Hooks**
   - `useCreatePost` → `useMutation` on `POST /api/v1/posts`, redirects to `/author/posts/{slug}` on success
   - `useUploadImage` → `useMutation` on `POST /api/v1/uploads/image`, returns URL for editor insertion

4. **Route guard** (`components/auth/AuthorGuard.tsx`)
   - Wrap author pages: redirect to `/` with toast "Author access required" if `user.role !== 'AUTHOR'`
