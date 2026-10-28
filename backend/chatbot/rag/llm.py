import os
from dotenv import load_dotenv
import requests
import json
from .search import search
load_dotenv()

url = os.getenv("URL")
model = os.getenv("MODEL")
max_turns = int(os.getenv("MAX_TURNS"))
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
  "You are the assistance for an abayashop."
  "Use search_documents to find information before answering."
  "If the results don't answer the question say so instead of guessing "
  "Keep answers short and friendly"
)

def ask(question):
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
        "mes.sages":messages,
        "tools": tools
      },
    )
    response.raise_for_status()
    message = response.json()["choices"][0]["message"]
    messages.append(message)
    tools_calls = message.get("tools_calls")
    if not tools_calls:
      return message["content"]
    for call in tools_calls:
      args = json.loads(call["function"]["arguments"])
      results = search(args["query"])
      messages.append({
        "role": "tool",
        "tool_call_id": call["id"],
        "content": json.dumps(results),
        })
    
  return "We are sorry we couldn't find any anwers for that question"
  


