import os
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client():
  """Create the Supabase client on first use so a missing key can't crash the whole app at import."""
  global _client
  if _client is None:
    from supabase import create_client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
      raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set for the chatbot.")
    _client = create_client(url, key)
  return _client


def store(rows):
  get_client().table("documents").upsert(
    rows,
    on_conflict="source,content",
  ).execute()
