Implement login and logout for the travel blog. Requires registered account.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.

---

## Backend — FastAPI (`backend/`)

**Endpoints:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`

1. **Schemas** (`app/schemas/auth.py`)
   ```python
   class LoginRequest(BaseModel):
       email: EmailStr
       password: str

   class TokenResponse(BaseModel):
       access_token: str
       refresh_token: str
       token_type: str = "bearer"
       expires_in: int  # seconds
   ```

2. **RefreshToken model** (`app/models/refresh_token.py`)
   - Fields: `id`, `token_hash` (SHA-256 of raw token), `user_id`, `expires_at`, `is_revoked`, `created_at`

3. **Auth service** (`app/services/auth_service.py`)
   - `login`: verify email + bcrypt password → issue JWT access token (1h) + refresh token (7d), store token hash in DB
   - `logout`: look up refresh token hash → set `is_revoked = True`
   - `refresh`: validate refresh token (not expired, not revoked) → issue new access token

4. **Security** (`app/core/security.py`)
   ```python
   def create_access_token(user_id: str, role: str) -> str: ...
   def create_refresh_token() -> tuple[str, str]: ...  # (raw_token, hashed_token)
   def decode_access_token(token: str) -> dict: ...
   ```

---

## Frontend — Next.js (`frontend/`)

1. **Auth store** (`store/authStore.ts`) — Zustand
   - State: `user`, `accessToken`, `isAuthenticated`
   - Actions: `setAuth(user, token)`, `clearAuth()`
   - Persist `accessToken` in memory only (not localStorage) — store `refreshToken` in httpOnly cookie

2. **Login page** (`app/(auth)/login/page.tsx`) + **LoginForm** (`components/auth/LoginForm.tsx`) — `"use client"`
   - Fields: email, password + show/hide toggle
   - On success: call `setAuth()`, redirect to previous page or `/`
   - Show `?registered=1` success banner

3. **Logout** — Button in Header/nav
   - Call `POST /api/v1/auth/logout` then `clearAuth()`
   - Redirect to `/`

4. **Axios interceptor** (`lib/api.ts`)
   - On 401: silently call `POST /api/v1/auth/refresh`, retry original request once
   - If refresh fails: `clearAuth()`, redirect to `/login`
