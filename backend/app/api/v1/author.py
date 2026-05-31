from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.repositories.post_repository import PostRepository
from app.schemas.common import PaginatedResponse
from app.schemas.post import AuthorPostDetail, AuthorPostListItem, PostCreate, PostResponse, PostUpdate
from app.services.post_service import PostService

router = APIRouter(prefix="/author/posts", tags=["author"])


@router.get("/", response_model=PaginatedResponse[AuthorPostListItem])
async def list_my_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("AUTHOR")),
):
    result = await PostRepository(db).get_author_posts(current_user.id, page, limit)
    return PaginatedResponse(
        items=[
            AuthorPostListItem(
                id=p.id,
                slug=p.slug,
                title=p.title,
                status=p.status,
                view_count=p.view_count,
                favorite_count=len(p.favorites),
                published_at=p.published_at,
                updated_at=p.updated_at,
            )
            for p in result.items
        ],
        total=result.total,
        page=result.page,
        limit=result.limit,
        pages=result.pages,
    )


@router.get("/{slug}", response_model=AuthorPostDetail)
async def get_my_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("AUTHOR")),
):
    post = await PostService(db).get_own_or_403(slug, current_user)
    return AuthorPostDetail(
        id=post.id,
        slug=post.slug,
        title=post.title,
        content=post.content,
        description=post.description,
        location=post.location,
        cover_image=post.cover_image,
        tags=[t.name for t in post.tags],
        author=post.author,
        view_count=post.view_count,
        favorite_count=len(post.favorites),
        is_favorited=False,
        published_at=post.published_at,
        status=post.status,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.post("/", response_model=PostResponse, status_code=201)
async def create_post(
    data: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("AUTHOR")),
):
    return await PostService(db).create(data, current_user)


@router.put("/{slug}", response_model=PostResponse)
async def update_post(
    slug: str,
    data: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("AUTHOR")),
):
    return await PostService(db).update(slug, data, current_user)


@router.delete("/{slug}", status_code=204)
async def delete_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("AUTHOR")),
):
    await PostService(db).delete(slug, current_user)
