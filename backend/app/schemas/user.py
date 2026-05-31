import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AuthorInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    display_name: str
    avatar_url: str | None
    bio: str | None


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    email: str
    display_name: str
    bio: str | None
    avatar_url: str | None
    role: str
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    display_name: str | None = Field(None, min_length=1, max_length=100)
    bio: str | None = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class AvatarResponse(BaseModel):
    avatar_url: str
