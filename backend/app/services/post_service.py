import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from slugify import slugify
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import Tag
from app.models.user import User
from app.repositories.post_repository import PostRepository
from app.schemas.post import PostCreate, PostUpdate


class PostService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = PostRepository(db)

    async def _get_or_create_tags(self, tag_names: list[str]) -> list[Tag]:
        from sqlalchemy import select
        tags = []
        for name in tag_names:
            slug = slugify(name)
            result = await self.db.execute(select(Tag).where(Tag.slug == slug))
            tag = result.scalar_one_or_none()
            if not tag:
                tag = Tag(name=name.lower(), slug=slug)
                self.db.add(tag)
                await self.db.flush()
            tags.append(tag)
        return tags

    async def _unique_slug(self, base: str) -> str:
        from sqlalchemy import select
        slug = slugify(base)
        counter = 1
        candidate = slug
        while True:
            result = await self.db.execute(
                select(Tag).where(Tag.slug == candidate)
            )
            from app.models.post import Post
            exists = await self.db.scalar(
                select(Post).where(Post.slug == candidate)
            )
            if not exists:
                return candidate
            candidate = f"{slug}-{counter}"
            counter += 1

    async def create(self, data: PostCreate, author: User):
        slug = await self._unique_slug(data.title)
        tags = await self._get_or_create_tags(data.tags)
        published_at = datetime.now(timezone.utc) if data.status == "PUBLISHED" else None

        post = await self.repo.create(
            slug=slug,
            title=data.title,
            content=data.content,
            description=data.description,
            location=data.location,
            cover_image=data.cover_image,
            status=data.status,
            author_id=author.id,
            published_at=published_at,
        )
        post.tags = tags
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def get_own_or_403(self, slug: str, user: User):
        post = await self.repo.get_by_slug(slug, published_only=False)
        if not post:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
        if post.author_id != user.id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not the post owner")
        return post

    async def update(self, slug: str, data: PostUpdate, user: User):
        post = await self.get_own_or_403(slug, user)
        update_data = data.model_dump(exclude_none=True)

        if "tags" in update_data:
            post.tags = await self._get_or_create_tags(update_data.pop("tags"))

        if update_data.get("status") == "PUBLISHED" and post.published_at is None:
            update_data["published_at"] = datetime.now(timezone.utc)

        await self.repo.update(post, **update_data)
        return post

    async def delete(self, slug: str, user: User) -> None:
        post = await self.get_own_or_403(slug, user)
        await self.repo.update(post, is_deleted=True, deleted_at=datetime.now(timezone.utc))
