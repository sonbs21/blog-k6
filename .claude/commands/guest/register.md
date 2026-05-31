Implement the user registration feature for the travel blog. No authentication required.

Read `.claude/agents/backend.md` and `.claude/agents/frontend.md` before writing code.

---

## Backend — FastAPI (`backend/`)

**Endpoint:** `POST /api/v1/auth/register`

1. **User model** (`app/models/user.py`)
   - Fields: `id` (UUID), `username` (unique), `email` (unique), `hashed_password`, `display_name`, `bio`, `avatar_url`, `role` (MEMBER/AUTHOR), `is_active`, `created_at`

2. **Schemas** (`app/schemas/auth.py`)
   ```python
   class RegisterRequest(BaseModel):
       username: str = Field(min_length=3, max_length=30, pattern=r'^[a-zA-Z0-9_]+$')
       email: EmailStr
       password: str = Field(min_length=8)
       display_name: str = Field(min_length=1, max_length=100)

   class RegisterResponse(BaseModel):
       id: uuid.UUID
       username: str
       email: str
       display_name: str
       role: str
   ```

3. **Service** (`app/services/auth_service.py`)
   - Check email uniqueness → raise `HTTPException(400, "Email already registered")`
   - Check username uniqueness → raise `HTTPException(400, "Username already taken")`
   - Hash password with `passlib` bcrypt
   - Create user with `role = MEMBER`
   - Return `RegisterResponse` (never return `hashed_password`)

---

## Frontend — Next.js (`frontend/`)

1. **Register page** (`app/(auth)/register/page.tsx`) — Server Component shell + Client form

2. **RegisterForm component** (`components/auth/RegisterForm.tsx`) — `"use client"`
   - Fields: `display_name`, `username`, `email`, `password`, `confirm_password`
   - Zod schema: password min 8 chars, confirm must match, username alphanumeric + underscore only
   - On success: redirect to `/login?registered=1`
   - Show server error inline (e.g., "Email already registered")

3. **Mutation hook** (`hooks/useRegister.ts`)
   - `useMutation` calling `POST /api/v1/auth/register`
   - On success: show toast "Account created! Please log in"
