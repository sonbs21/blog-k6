from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.repositories.post_repository import PostRepository
from app.schemas.common import PaginatedResponse
from app.schemas.post import PostDetail, PostListItem
from app.schemas.user import AuthorInfo

router = APIRouter(prefix="/posts", tags=["posts"])


def _to_list_item(post, favorite_count: int = 0, is_favorited: bool = False) -> PostListItem:
    return PostListItem(
        id=post.id,
        slug=post.slug,
        title=post.title,
        description=post.description,
        location=post.location,
        cover_image=post.cover_image,
        tags=[t.name for t in post.tags],
        author=post.author,
        view_count=post.view_count,
        favorite_count=favorite_count,
        published_at=post.published_at,
        is_favorited=is_favorited,
    )


@router.get("/", response_model=PaginatedResponse[PostListItem])
async def list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    tag: str | None = None,
    location: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    result = await PostRepository(db).get_published_list(page, limit, tag, location)
    return PaginatedResponse(
        items=[_to_list_item(p, len(p.favorites)) for p in result.items],
        total=result.total,
        page=result.page,
        limit=result.limit,
        pages=result.pages,
    )


@router.get("/{slug}", response_model=PostDetail)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    repo = PostRepository(db)
    post = await repo.get_by_slug(slug)
    if post is None:
        raise HTTPException(404, detail="Post not found")

    # Read all values as plain Python primitives BEFORE any commit.
    # increment_view commits the session, which expires columns with onupdate
    # (e.g. updated_at). Accessing expired ORM attributes inside a sync
    # Pydantic __init__ call triggers a lazy-load → MissingGreenlet error.
    data = dict(
        id=post.id, slug=post.slug, title=post.title, content=post.content,
        description=post.description, location=post.location,
        cover_image=post.cover_image, view_count=post.view_count,
        is_favorited=False, published_at=post.published_at,
        created_at=post.created_at, updated_at=post.updated_at,
        tags=[t.name for t in post.tags],
        author=AuthorInfo(
            id=post.author.id, username=post.author.username,
            display_name=post.author.display_name,
            avatar_url=post.author.avatar_url, bio=post.author.bio,
        ),
    )

    await repo.increment_view(post)
    data["favorite_count"] = await repo.get_favorite_count(post.id)

    return PostDetail(**data)
