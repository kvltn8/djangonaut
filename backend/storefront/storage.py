#Handles the image storage logic.
import uuid
from supabase import create_client
from django.conf import settings
BUCKET = "productimages"
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)#creating table in supabase.

def uploadproductimage(file):
    extension = file.name.split(".")[-1]

    filename = f"{uuid.uuid4()}.{extension}"
    supabase.storage.from_(BUCKET).upload(
        filename, file.read(), {"content-type": file.content_type}
    )
    return supabase.storage.from_(BUCKET).get_public_url(filename)

def deleteproductimage(url):
    filename = url.split("?")[0].rstrip("/").split("/")[-1]
    supabase.storage.from_(BUCKET).remove([filename])