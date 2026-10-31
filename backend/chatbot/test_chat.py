import pytest
from rest_framework import status
from rest_framework.test import APIClient

from chatbot import views
from chatbot.rag import llm


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    from django.core.cache import cache
    cache.clear()


@pytest.mark.django_db
class TestChatEndpoint:
    def test_returns_answer(self, monkeypatch):
        monkeypatch.setattr(views, "ask", lambda q: f"echo: {q}")
        r = APIClient().post("/api/chat/", {"message": "  do you ship?  "}, format="json")
        assert r.status_code == status.HTTP_200_OK
        assert r.data == {"answer": "echo: do you ship?"}

    @pytest.mark.parametrize("payload", [{}, {"message": "   "}, {"message": "x" * 501}])
    def test_rejects_bad_messages(self, payload):
        assert APIClient().post("/api/chat/", payload, format="json").status_code == status.HTTP_400_BAD_REQUEST

    def test_upstream_failure_is_a_clean_503(self, monkeypatch):
        def boom(_):
            raise RuntimeError("llm down")
        monkeypatch.setattr(views, "ask", boom)
        r = APIClient().post("/api/chat/", {"message": "hi"}, format="json")
        assert r.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert "unavailable" in r.data["Error"]

    def test_is_rate_limited(self, monkeypatch, settings):
        from rest_framework.throttling import AnonRateThrottle
        monkeypatch.setattr(views, "ask", lambda q: "ok")
        monkeypatch.setitem(AnonRateThrottle.THROTTLE_RATES, "anon", "2/min")
        client = APIClient()
        codes = [client.post("/api/chat/", {"message": "hi"}, format="json").status_code for _ in range(3)]
        assert codes == [200, 200, 429]


class FakeResponse:
    def __init__(self, message):
        self._message = message
    def raise_for_status(self):
        pass
    def json(self):
        return {"choices": [{"message": self._message}]}


def test_ask_runs_the_search_tool_then_answers(monkeypatch):
    monkeypatch.setenv("URL", "http://llm.test"); monkeypatch.setenv("MODEL", "m"); monkeypatch.setenv("MAX_TURNS", "3")
    sent = []
    replies = iter([
        {"role": "assistant", "content": None, "tool_calls": [{"id": "1", "function": {"name": "search_documents", "arguments": '{"query": "shipping"}'}}]},
        {"role": "assistant", "content": "We ship across Kenya."},
    ])
    def fake_post(url, json=None, **kw):
        sent.append(json)
        return FakeResponse(next(replies))
    monkeypatch.setattr(llm.requests, "post", fake_post)
    monkeypatch.setattr(llm, "search", lambda q: [{"content": "Free shipping over KSh 10,000"}])

    assert llm.ask("Do you ship?") == "We ship across Kenya."
    assert all("messages" in body for body in sent)  # was misspelled "mes.sages"
    assert any(m["role"] == "tool" for m in sent[1]["messages"])
