import json
import logging
import os

import requests
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def embedding_text(text):
  """Return a list of embedding vectors for `text`, or None if the provider call fails.

  Needs EMBEDDING_URL, EMBEDDING_MODEL and OPENROUTER_API_KEY. The reason for any failure
  is written to the server log so it is easy to find on Render.
  """
  url = os.getenv("EMBEDDING_URL")
  model = os.getenv("EMBEDDING_MODEL")
  if not url or not model:
    logger.error("Chatbot embeddings are not configured: set EMBEDDING_URL and EMBEDDING_MODEL.")
    return None
  try:
    response = requests.post(
      url,
      headers={
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json",
      },
      data=json.dumps({
        "model": model,
        "input": text,
        "encoding_format": "float"
      }),
      timeout=30,
    )
    response.raise_for_status()
    return [item["embedding"] for item in response.json()["data"]]
  except (requests.exceptions.RequestException, KeyError, ValueError) as e:
    logger.error("Embedding request failed: %s", e)
    return None
