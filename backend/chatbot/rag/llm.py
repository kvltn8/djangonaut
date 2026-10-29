import os
from dotenv import load_dotenv
import requests
import json
from .search import search
load_dotenv()

# Read at call time (not import time) so a missing variable cannot stop the server from starting.
def _settings():
  return os.getenv("URL"), os.getenv("MODEL"), int(os.getenv("MAX_TURNS") or 3)
tools = [{
  "type": "function",
  "function":{
    "name":"search_documents",
    "description":"search the knowledge based for context relevant to a query."
                  "use it whenever the question needs a facts from the documents",
    "parameters": {
      "type": "object", 
      "properties": {
        "query": {
          "type": "string",
          "description":"what to search for" ,
        },
      },
      "required": ["query"],
    },
  },
}]

SYSTEM_PROMPT=(
  "You are the friendly shop assistant for Kaltun's Abaya Shop. Prices are in Kenyan Shillings (KSh). "
  "Use search_documents to find information before answering."
  "If the results don't answer the question say so instead of guessing "
  "Keep answers short and friendly"
)

def ask(question):
  url, model, max_turns = _settings()
  messages=[
      {
        "role": "system", "content": SYSTEM_PROMPT
      },
      {
        "role": "user", "content": question
      },
    ]


  for _ in range(max_turns):
    response= requests.post(
      url,
      headers={"Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}"},
      json={
        "model": model,
        "messages":messages,
        "tools": tools
      },
      timeout=45,
    )
    response.raise_for_status()
    message = response.json()["choices"][0]["message"]
    messages.append(message)
    tool_calls = message.get("tool_calls")
    if not tool_calls:
      return message.get("content") or "We are sorry we couldn't find any anwers for that question"
    for call in tool_calls:
      args = json.loads(call["function"]["arguments"])
      results = search(args["query"])
      messages.append({
        "role": "tool",
        "tool_call_id": call["id"],
        "content": json.dumps(results),
        })
    
  return "We are sorry we couldn't find any anwers for that question"
  


