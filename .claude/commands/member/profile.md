Implement personal profile management for authenticated members.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.
All endpoints require `Authorization: Bearer {access_token}`.

---

## Backend — FastAPI (`backend/`)

**Endpoints:**
- `GET  /api/v1/users/me`
- `PUT  /api/v1/users/me`
- `POST /api/v1/users/me/avatar`
- `PUT  /api/v1/users/me/password`

1. **Schemas** (`app/schemas/user.py`)
   ```python
   class UserProfile(BaseModel):
       model_config = ConfigDict(from_attributes=True)
       id: uuid.UUID
       username: str
       email: str          # read-only, never updated here
       display_name: str
       bio: str | None
       avatar_url: str | None
       role: str

   class UpdateProfileRequest(BaseModel):
       display_name: str | None = Field(None, min_length=1, max_length=100)
       bio: str | None = Field(None, max_length=500)

   class ChangePasswordRequest(BaseModel):
       current_password: str
       new_password: str = Field(min_length=8)
   ```

2. **Avatar upload** (`app/api/v1/users.py`)
   - Accept `multipart/form-data` with `file: UploadFile`
   - Validate: `content_type` must be `image/jpeg` or `image/png` or `image/webp`, max 2MB
   - Upload to S3 at key `avatars/{user_id}/{uuid}.{ext}` via boto3
   - Update `user.avatar_url` in DB
   - Return new `avatar_url`

3. **Change password**
   - Verify `current_password` against stored hash with bcrypt
   - Hash and store `new_password`
   - Revoke all existing refresh tokens for this user (force re-login on other devices)

---

## Frontend — Next.js (`frontend/`)

1. **Profile page** (`app/(member)/profile/page.tsx`) — protected route (redirect to `/login` if not authenticated)

2. **ProfileForm** (`components/member/ProfileForm.tsx`) — `"use client"`
   - Pre-filled with current user data from auth store
   - Avatar: click to upload, preview new image before saving
   - `display_name` and `bio` fields
   - Submit calls `PUT /api/v1/users/me`

3. **ChangePasswordForm** (`components/member/ChangePasswordForm.tsx`) — separate section on same page
   - Fields: current_password, new_password, confirm_new_password
   - Zod: new_password min 8 chars, confirm must match

4. **Hooks**
   - `useUpdateProfile` → `useMutation` on `PUT /api/v1/users/me`, updates auth store on success
   - `useUploadAvatar` → `useMutation` on `POST /api/v1/users/me/avatar`
   - `useChangePassword` → `useMutation` on `PUT /api/v1/users/me/password`, clears auth + redirects to login on success
