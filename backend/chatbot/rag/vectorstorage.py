import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase=create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def store(rows):
  supabase.table("documents").upsert(
    rows,
    on_conflict="source,content",
  ).execute()
