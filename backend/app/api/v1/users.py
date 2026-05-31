import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy import delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.favorite import Favorite
from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User
from app.repositories.post_repository import PostRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import PaginatedResponse
from app.schemas.post import PostListItem
from app.schemas.user import AvatarResponse, ChangePasswordRequest, UpdateProfileRequest, UserProfile
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserProfile)
async def update_me(
    data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await UserService(db).update_profile(current_user, data)


@router.post("/me/avatar", response_model=AvatarResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = await UserService(db).update_avatar(current_user, file)
    return AvatarResponse(avatar_url=url)


@router.put("/me/password", status_code=204)
async def change_password(
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await UserService(db).change_password(current_user, data)


@router.get("/me/favorites", response_model=PaginatedResponse[PostListItem])
async def get_favorites(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    query = (
        select(Post)
        .join(Favorite, Favorite.post_id == Post.id)
        .where(Favorite.user_id == current_user.id, Post.is_deleted.is_(False))
        .options(selectinload(Post.author), selectinload(Post.tags), selectinload(Post.favorites))
        .order_by(Favorite.created_at.desc())
    )
    from sqlalchemy import func
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    results = await db.execute(query.offset((page - 1) * limit).limit(limit))
    import math
    items = list(results.scalars().all())
    from app.schemas.common import PaginatedResponse as PR
    return PR(items=items, total=total or 0, page=page, limit=limit, pages=math.ceil((total or 0) / limit))


@router.post("/me/favorites/{slug}", status_code=204)
async def add_favorite(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await PostRepository(db).get_by_slug(slug)
    if not post:
        from fastapi import HTTPException
        raise HTTPException(404)
    await db.execute(
        insert(Favorite).values(user_id=current_user.id, post_id=post.id).prefix_with("OR IGNORE")
    )
    await db.commit()


@router.delete("/me/favorites/{slug}", status_code=204)
async def remove_favorite(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = await PostRepository(db).get_by_slug(slug)
    if post:
        await db.execute(
            delete(Favorite).where(Favorite.user_id == current_user.id, Favorite.post_id == post.id)
        )
        await db.commit()


@router.post("/me/following/{username}", status_code=204)
async def follow_user(
    username: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = await UserRepository(db).get_by_username(username)
    if not target:
        from fastapi import HTTPException
        raise HTTPException(404)
    if target.id == current_user.id:
        from fastapi import HTTPException
        raise HTTPException(400, detail="Cannot follow yourself")
    await db.execute(
        insert(Follow).values(follower_id=current_user.id, following_id=target.id).prefix_with("OR IGNORE")
    )
    await db.commit()


@router.delete("/me/following/{username}", status_code=204)
async def unfollow_user(
    username: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = await UserRepository(db).get_by_username(username)
    if target:
        await db.execute(
            delete(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == target.id)
        )
        await db.commit()


@router.get("/me/feed", response_model=PaginatedResponse[PostListItem])
async def get_feed(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    from sqlalchemy import func
    import math
    query = (
        select(Post)
        .join(Follow, Follow.following_id == Post.author_id)
        .where(
            Follow.follower_id == current_user.id,
            Post.status == "PUBLISHED",
            Post.is_deleted.is_(False),
        )
        .options(selectinload(Post.author), selectinload(Post.tags), selectinload(Post.favorites))
        .order_by(Post.published_at.desc())
    )
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    results = await db.execute(query.offset((page - 1) * limit).limit(limit))
    items = list(results.scalars().all())
    from app.schemas.common import PaginatedResponse as PR
    return PR(items=items, total=total or 0, page=page, limit=limit, pages=math.ceil((total or 0) / limit))
