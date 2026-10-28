from rest_framework.decorators import api_view, throttle_classes#gives the user a limit to the chats.
from rest_framework.throttling import AnonRateThrottle#Argument that is passed to our throttle decorator.
from rest_framework.response import Response
from .rag.llm import ask
from .rag.search import search

@api_view(["POST"])
@throttle_classes([AnonRateThrottle])

def chat(request):
  question = request.data.get("message", "").strip()
  if not question:
    return Response({"Error":"Message is required"}, status=400)
  chunks = search(question)
  answer = ask(chunks)
  return Response({"answer": answer})


