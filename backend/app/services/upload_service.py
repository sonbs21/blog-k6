import io
import uuid

import boto3
from PIL import Image

from app.core.config import settings

MAX_WIDTH = 1920


class UploadService:
    def __init__(self) -> None:
        self.s3 = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

    def _resize(self, content: bytes) -> bytes:
        img = Image.open(io.BytesIO(content))
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=85)
        return buf.getvalue()

    async def upload_bytes(self, content: bytes, key: str, content_type: str) -> str:
        resized = self._resize(content)
        self.s3.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=resized,
            ContentType="image/webp",
            CacheControl="public,max-age=31536000,immutable",
        )
        return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

    async def upload_post_image(self, content: bytes, author_id: str, content_type: str) -> str:
        key = f"posts/{author_id}/{uuid.uuid4()}.webp"
        return await self.upload_bytes(content, key, content_type)
