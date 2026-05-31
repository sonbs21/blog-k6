import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="MEMBER")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    posts: Mapped[list["Post"]] = relationship("Post", back_populates="author")  # type: ignore[name-defined]
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user", foreign_keys="Favorite.user_id")  # type: ignore[name-defined]
    following: Mapped[list["Follow"]] = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower")  # type: ignore[name-defined]
    followers: Mapped[list["Follow"]] = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following_user")  # type: ignore[name-defined]
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship("RefreshToken", back_populates="user")  # type: ignore[name-defined]
