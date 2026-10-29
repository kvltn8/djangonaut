#This is file holds the logic for searching and the llm will be using as tool.

from .embedding import embedding_text
from . import vectorstorage

def search(query, top_k=5):
  vectors = embedding_text(query)
  if not vectors:
    raise RuntimeError("Could not create an embedding for the query.")
  results = vectorstorage.get_client().rpc(
    "match_documents",
    {"query_embedding": vectors[0], "match_count": top_k}
  ).execute()
  return results.data
