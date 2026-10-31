import logging

from rest_framework.decorators import api_view, throttle_classes  # gives the user a limit to the chats.
from rest_framework.throttling import AnonRateThrottle  # Argument that is passed to our throttle decorator.
from rest_framework.response import Response

from .rag.llm import ask

logger = logging.getLogger(__name__)
MAX_MESSAGE_LENGTH = 500


@api_view(["POST"])
@throttle_classes([AnonRateThrottle])
def chat(request):
  question = str(request.data.get("message", "")).strip()
  if not question:
    return Response({"Error": "Message is required"}, status=400)
  if len(question) > MAX_MESSAGE_LENGTH:
    return Response({"Error": f"Message is too long (max {MAX_MESSAGE_LENGTH} characters)"}, status=400)
  try:
    # ask() searches the knowledge base itself (as an LLM tool) and returns the final answer.
    answer = ask(question)
  except Exception:
    logger.exception("Chat request failed")
    return Response({"Error": "The assistant is unavailable right now. Please try again shortly."}, status=503)
  return Response({"answer": answer})
