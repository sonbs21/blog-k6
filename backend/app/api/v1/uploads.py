from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.core.dependencies import require_role
from app.models.user import User
from app.services.upload_service import UploadService

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024


class UploadResponse(BaseModel):
    url: str


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("AUTHOR")),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Unsupported image format")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 5MB")

    url = await UploadService().upload_post_image(content, str(current_user.id), file.content_type)
    return UploadResponse(url=url)
