import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.repositories.token_repository import TokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.user_repo = UserRepository(db)
        self.token_repo = TokenRepository(db)

    async def register(self, data: RegisterRequest):
        if await self.user_repo.get_by_email(data.email):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        if await self.user_repo.get_by_username(data.username):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username already taken")

        return await self.user_repo.create(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
            display_name=data.display_name,
            role="MEMBER",
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Account is disabled")

        access_token = create_access_token(str(user.id), user.role)
        raw_refresh, hashed_refresh = create_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, hashed_refresh, expires_at)

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh(self, raw_token: str) -> TokenResponse:
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        token = await self.token_repo.get_valid(token_hash)
        if not token:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

        await self.token_repo.revoke(token_hash)

        user = await self.user_repo.get_by_id(token.user_id)
        if not user:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="User not found")

        access_token = create_access_token(str(user.id), user.role)
        new_raw, new_hashed = create_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, new_hashed, expires_at)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_raw,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def logout(self, raw_token: str) -> None:
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        await self.token_repo.revoke(token_hash)
