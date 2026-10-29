"""Product image storage (Supabase Storage).

Images are uploaded to a public bucket and only the public URL is saved in the
database (ProductsImage.image).
"""
import logging
import mimetypes
import uuid

from django.conf import settings

logger = logging.getLogger(__name__)

BUCKET = "productimages"
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

_client = None


class ImageUploadError(Exception):
    """Raised with a message that is safe to show to the person uploading."""


def _get_client():
    """Create the Supabase client on first use.

    Doing this lazily means a missing/incorrect SUPABASE_* variable only breaks
    image uploads, not the entire API (and not `manage.py migrate/collectstatic`).
    """
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise ImageUploadError(
                "Image storage is not configured. Set SUPABASE_URL and "
                "SUPABASE_SERVICE_KEY on the server."
            )
        from supabase import create_client

        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


def validate_image_file(file):
    """Reject oversized or non-image uploads with a readable message."""
    size = getattr(file, "size", None)
    if size is not None and size > MAX_IMAGE_BYTES:
        raise ImageUploadError("Image is too large. Please upload a file under 5 MB.")

    content_type = getattr(file, "content_type", None) or mimetypes.guess_type(file.name)[0]
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ImageUploadError("Unsupported image type. Please upload a JPG, PNG or WebP file.")


def uploadproductimage(file):
    """Upload `file` and return its public URL."""
    validate_image_file(file)

    extension = (file.name.rsplit(".", 1)[-1] if "." in file.name else "jpg").lower()
    filename = f"{uuid.uuid4()}.{extension}"
    content_type = getattr(file, "content_type", None) or mimetypes.guess_type(file.name)[0]

    client = _get_client()
    try:
        file.seek(0)
        client.storage.from_(BUCKET).upload(
            filename,
            file.read(),
            {"content-type": content_type, "upsert": "true"},
        )
        url = client.storage.from_(BUCKET).get_public_url(filename)
    except ImageUploadError:
        raise
    except Exception as exc:
        logger.exception("Supabase image upload failed")
        raise ImageUploadError(
            "The image could not be uploaded to storage. Check that the "
            f"'{BUCKET}' bucket exists and is public, then try again."
        ) from exc

    url = (url or "").split("?")[0]
    if not url:
        raise ImageUploadError("The image upload failed. No image URL was returned.")
    return url


def deleteproductimage(url):
    filename = url.split("?")[0].rstrip("/").split("/")[-1]
    _get_client().storage.from_(BUCKET).remove([filename])
