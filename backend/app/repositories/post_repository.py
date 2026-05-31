import math
import uuid

from sqlalchemy import func, or_, select
from app.models.post_tag import post_tags
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite import Favorite
from app.models.post import Post
from app.models.tag import Tag
from app.schemas.common import Page


class PostRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _base_query(self):
        return (
            select(Post)
            .where(Post.is_deleted.is_(False))
            .options(selectinload(Post.author), selectinload(Post.tags), selectinload(Post.favorites))
        )

    def _page(self, items: list[Post], total: int, page: int, limit: int) -> Page[Post]:
        return Page(items=items, total=total, page=page, limit=limit, pages=math.ceil(total / limit) if limit else 1)

    async def get_published_list(
        self,
        page: int = 1,
        limit: int = 12,
        tag: str | None = None,
        location: str | None = None,
    ) -> Page[Post]:
        query = self._base_query().where(Post.status == "PUBLISHED")
        if tag:
            query = query.join(Post.tags).where(Tag.slug == tag)
        if location:
            query = query.where(Post.location.ilike(f"%{location}%"))
        query = query.order_by(Post.published_at.desc())

        total = await self.db.scalar(select(func.count()).select_from(query.subquery())) or 0
        results = await self.db.execute(query.offset((page - 1) * limit).limit(limit))
        return self._page(list(results.scalars().all()), total, page, limit)

    async def get_by_slug(self, slug: str, published_only: bool = True) -> Post | None:
        query = self._base_query().where(Post.slug == slug)
        if published_only:
            query = query.where(Post.status == "PUBLISHED")
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_author_posts(self, author_id: uuid.UUID, page: int = 1, limit: int = 20) -> Page[Post]:
        query = self._base_query().where(Post.author_id == author_id).order_by(Post.updated_at.desc())
        total = await self.db.scalar(select(func.count()).select_from(query.subquery())) or 0
        results = await self.db.execute(query.offset((page - 1) * limit).limit(limit))
        return self._page(list(results.scalars().all()), total, page, limit)

    async def search(self, q: str, page: int = 1, limit: int = 20) -> Page[Post]:
        pattern = f"%{q}%"
        tag_match = (
            select(post_tags.c.post_id)
            .join(Tag, Tag.id == post_tags.c.tag_id)
            .where(Tag.name.ilike(pattern))
            .scalar_subquery()
        )
        query = (
            self._base_query()
            .where(Post.status == "PUBLISHED")
            .where(or_(
                Post.title.ilike(pattern),
                Post.description.ilike(pattern),
                Post.location.ilike(pattern),
                Post.id.in_(tag_match),
            ))
            .order_by(Post.published_at.desc())
        )
        total = await self.db.scalar(select(func.count()).select_from(query.subquery())) or 0
        results = await self.db.execute(query.offset((page - 1) * limit).limit(limit))
        return self._page(list(results.scalars().all()), total, page, limit)

    async def create(self, **kwargs) -> Post:
        post = Post(**kwargs)
        self.db.add(post)
        await self.db.flush()
        await self.db.refresh(post, ["author", "tags", "favorites"])
        await self.db.commit()
        return post

    async def update(self, post: Post, **kwargs) -> Post:
        for key, value in kwargs.items():
            setattr(post, key, value)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def increment_view(self, post: Post) -> None:
        post.view_count += 1
        await self.db.commit()

    async def get_favorite_count(self, post_id: uuid.UUID) -> int:
        return await self.db.scalar(select(func.count()).where(Favorite.post_id == post_id)) or 0

    async def is_favorited_by(self, post_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        count = await self.db.scalar(
            select(func.count()).where(Favorite.post_id == post_id, Favorite.user_id == user_id)
        )
        return (count or 0) > 0
