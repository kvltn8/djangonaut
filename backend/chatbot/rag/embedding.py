import requests 
import json 
import os 
from dotenv import load_dotenv

load_dotenv()

def embedding_text(text):
  try:
    response = requests.post(
      os.getenv("EMBEDDING_URL"),
      headers={
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json",
      },
      data=json.dumps({
        "model": os.getenv("EMBEDDING_MODEL"),
        "input": text,
        "encoding_format": "float"
      }),
    )
    response.raise_for_status()
    results = [item["embedding"] for item in response.json()["data"]]
    return results
  except requests.exceptions.RequestException as e:
    print(f"an error occured{e}")
    return None

