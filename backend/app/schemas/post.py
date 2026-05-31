import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import AuthorInfo


class PostCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    content: str = Field(min_length=10)
    description: str = Field(max_length=160)
    location: str = Field(min_length=1, max_length=255)
    cover_image: str | None = None
    tags: list[str] = Field(default=[], max_length=5)
    status: Literal["DRAFT", "PUBLISHED"] = "DRAFT"


class PostUpdate(BaseModel):
    title: str | None = Field(None, min_length=5, max_length=255)
    content: str | None = None
    description: str | None = Field(None, max_length=160)
    location: str | None = None
    cover_image: str | None = None
    tags: list[str] | None = Field(None, max_length=5)
    status: Literal["DRAFT", "PUBLISHED"] | None = None


class PostListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    slug: str
    title: str
    description: str
    location: str
    cover_image: str | None
    tags: list[str]
    author: AuthorInfo
    view_count: int
    favorite_count: int
    published_at: datetime | None
    is_favorited: bool = False


class PostDetail(PostListItem):
    content: str
    created_at: datetime
    updated_at: datetime


class AuthorPostDetail(PostDetail):
    status: str


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


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    slug: str
    title: str
    status: str
    author: AuthorInfo
    published_at: datetime | None
    created_at: datetime


class SearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    description: str
    location: str
    cover_image: str | None
    tags: list[str]
    author_name: str
    published_at: datetime | None
