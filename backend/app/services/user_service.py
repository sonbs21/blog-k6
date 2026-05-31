import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.token_repository import TokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import ChangePasswordRequest, UpdateProfileRequest


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)
        self.token_repo = TokenRepository(db)

    async def update_profile(self, user: User, data: UpdateProfileRequest) -> User:
        kwargs = data.model_dump(exclude_none=True)
        if not kwargs:
            return user
        return await self.user_repo.update(user, **kwargs)

    async def update_avatar(self, user: User, file: UploadFile) -> str:
        from app.services.upload_service import UploadService
        if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Unsupported image format")
        content = await file.read()
        if len(content) > 2 * 1024 * 1024:
            raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 2MB")

        url = await UploadService().upload_bytes(
            content, f"avatars/{user.id}/{uuid.uuid4()}.jpg", file.content_type
        )
        await self.user_repo.update(user, avatar_url=url)
        return url

    async def change_password(self, user: User, data: ChangePasswordRequest) -> None:
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
        await self.user_repo.update(user, hashed_password=hash_password(data.new_password))
        await self.token_repo.revoke_all_for_user(user.id)
