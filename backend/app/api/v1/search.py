from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.repositories.post_repository import PostRepository
from app.schemas.common import PaginatedResponse
from app.schemas.post import PostListItem

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=PaginatedResponse[PostListItem])
async def search_posts(
    q: str = Query(min_length=2, max_length=100),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    result = await PostRepository(db).search(q, page, limit)
    return PaginatedResponse(
        items=[
            PostListItem(
                id=p.id,
                slug=p.slug,
                title=p.title,
                description=p.description,
                location=p.location,
                cover_image=p.cover_image,
                tags=[t.name for t in p.tags],
                author=p.author,
                view_count=p.view_count,
                favorite_count=len(p.favorites),
                published_at=p.published_at,
                is_favorited=False,
            )
            for p in result.items
        ],
        total=result.total,
        page=result.page,
        limit=result.limit,
        pages=result.pages,
    )
