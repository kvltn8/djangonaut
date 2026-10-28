#This is file holds the logic for searching and the llm will be using as tool.

from .embedding import embedding_text
from . import vectorstorage

def search(query, top_k=5):
  query_vector = embedding_text(query)[0]
  results = vectorstorage.supabase.rpc(
    "match_documents",
    {"query_embedding": query_vector, "match_count": top_k}
  ).execute()
  return results.data


