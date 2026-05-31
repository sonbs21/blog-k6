import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (CheckConstraint("follower_id != following_id", name="no_self_follow"),)

    follower_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    following_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    follower: Mapped["User"] = relationship("User", foreign_keys=[follower_id], back_populates="following")  # type: ignore[name-defined]
    following_user: Mapped["User"] = relationship("User", foreign_keys=[following_id], back_populates="followers")  # type: ignore[name-defined]
