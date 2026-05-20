"""Pytest suite for Practice Questions & AI Mentor endpoints (EdVNova)."""
import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://igcse-elite.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASS = "Admin@123"


# ── Fixtures ──
@pytest.fixture(scope="module")
def session():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def student_session():
    """Register & login a fresh student user."""
    s = requests.Session()
    email = f"test_student_{uuid.uuid4().hex[:8]}@edvnova.com"
    pw = "Student@123"
    r = s.post(f"{API}/auth/register", json={
        "email": email, "password": pw, "name": "Test Student"
    })
    if r.status_code not in (200, 201):
        # Maybe already exists from earlier; try login
        r2 = s.post(f"{API}/auth/login", json={"email": email, "password": pw})
        assert r2.status_code == 200, f"Student register/login failed: {r.status_code} {r.text}"
    return s


# ────────────────────────────────────────────────────────
# PUBLIC BROWSE ENDPOINTS
# ────────────────────────────────────────────────────────
class TestQuestionsBrowse:
    def test_browse_all_returns_questions(self, session):
        r = session.get(f"{API}/questions/browse")
        assert r.status_code == 200
        data = r.json()
        assert "questions" in data and "total" in data
        assert data["total"] >= 15, f"Expected >=15 seeded questions, got {data['total']}"
        assert len(data["questions"]) > 0
        q = data["questions"][0]
        assert "id" in q and "_id" not in q
        assert "subject" in q and "question_text" in q

    def test_browse_filter_subject_physics(self, session):
        r = session.get(f"{API}/questions/browse", params={"subject": "physics"})
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 1
        for q in data["questions"]:
            assert q["subject"] == "physics"

    def test_browse_filter_difficulty_easy(self, session):
        r = session.get(f"{API}/questions/browse", params={"difficulty": "easy"})
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 1
        for q in data["questions"]:
            assert q["difficulty"] == "easy"

    def test_topics_endpoint(self, session):
        r = session.get(f"{API}/questions/topics")
        assert r.status_code == 200
        topics = r.json()
        assert isinstance(topics, list)
        assert len(topics) >= 5

    def test_topics_filtered_by_subject(self, session):
        r = session.get(f"{API}/questions/topics", params={"subject": "chemistry"})
        assert r.status_code == 200
        topics = r.json()
        assert isinstance(topics, list)


# ────────────────────────────────────────────────────────
# ADMIN ENDPOINTS
# ────────────────────────────────────────────────────────
class TestQuestionsAdmin:
    created_id = None

    def test_admin_stats_requires_auth(self, session):
        r = session.get(f"{API}/questions/admin/stats")
        assert r.status_code in (401, 403)

    def test_admin_stats(self, admin_session):
        r = admin_session.get(f"{API}/questions/admin/stats")
        assert r.status_code == 200
        data = r.json()
        assert "total" in data and "by_subject" in data and "by_board" in data
        assert data["total"] >= 15
        assert "physics" in data["by_subject"]

    def test_admin_list_paginated(self, admin_session):
        r = admin_session.get(f"{API}/questions/admin/list", params={"page": 1, "limit": 10})
        assert r.status_code == 200
        data = r.json()
        assert "questions" in data and "total" in data
        assert len(data["questions"]) <= 10

    def test_admin_create_question(self, admin_session):
        payload = {
            "subject": "physics", "board": "igcse",
            "topic": "TEST_Topic", "chapter": "TEST_Chapter",
            "difficulty": "medium", "paper_type": "structured",
            "question_text": "TEST_Q: What is 2+2?",
            "marks": 1, "answer": "4",
            "mark_scheme": "4 [1]", "tags": ["test"],
            "year": "2024", "paper_number": "Paper 1",
        }
        r = admin_session.post(f"{API}/questions/admin/create", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data
        TestQuestionsAdmin.created_id = data["id"]

        # Verify via public GET
        r2 = admin_session.get(f"{API}/questions/{data['id']}")
        assert r2.status_code == 200
        q = r2.json()
        assert q["question_text"] == payload["question_text"]
        assert q["marks"] == 1

    def test_admin_update_question(self, admin_session):
        qid = TestQuestionsAdmin.created_id
        assert qid, "create test must run first"
        r = admin_session.put(f"{API}/questions/admin/{qid}", json={"marks": 5, "difficulty": "hard"})
        assert r.status_code == 200
        r2 = admin_session.get(f"{API}/questions/{qid}")
        q = r2.json()
        assert q["marks"] == 5
        assert q["difficulty"] == "hard"

    def test_admin_delete_question(self, admin_session):
        qid = TestQuestionsAdmin.created_id
        assert qid
        r = admin_session.delete(f"{API}/questions/admin/{qid}")
        assert r.status_code == 200
        r2 = admin_session.get(f"{API}/questions/{qid}")
        assert r2.status_code == 404


# ────────────────────────────────────────────────────────
# STUDENT BOOKMARK / COMPLETE
# ────────────────────────────────────────────────────────
class TestStudentInteractions:
    def test_bookmark_requires_auth(self, session):
        r = session.post(f"{API}/questions/bookmark/000000000000000000000000")
        assert r.status_code in (401, 403)

    def test_bookmark_toggle(self, student_session):
        # Get a real question id
        browse = student_session.get(f"{API}/questions/browse").json()
        qid = browse["questions"][0]["id"]
        r1 = student_session.post(f"{API}/questions/bookmark/{qid}")
        assert r1.status_code == 200
        assert r1.json()["bookmarked"] is True
        r2 = student_session.post(f"{API}/questions/bookmark/{qid}")
        assert r2.status_code == 200
        assert r2.json()["bookmarked"] is False

    def test_complete_toggle(self, student_session):
        browse = student_session.get(f"{API}/questions/browse").json()
        qid = browse["questions"][0]["id"]
        r1 = student_session.post(f"{API}/questions/complete/{qid}")
        assert r1.status_code == 200
        assert r1.json()["completed"] is True
        r2 = student_session.post(f"{API}/questions/complete/{qid}")
        assert r2.json()["completed"] is False


# ────────────────────────────────────────────────────────
# AI MENTOR
# ────────────────────────────────────────────────────────
class TestAIMentor:
    session_id = None

    def test_chat_requires_auth(self, session):
        r = session.post(f"{API}/ai-mentor/chat", json={"message": "hi"})
        assert r.status_code in (401, 403)

    def test_chat_basic_message(self, student_session):
        payload = {
            "message": "Briefly state Ohm's law in one sentence.",
            "board": "igcse",
            "subject": "physics",
            "topic": "Electricity",
        }
        r = student_session.post(f"{API}/ai-mentor/chat", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "response" in data and "session_id" in data
        assert isinstance(data["response"], str) and len(data["response"]) > 0
        TestAIMentor.session_id = data["session_id"]

    def test_sessions_list(self, student_session):
        r = student_session.get(f"{API}/ai-mentor/sessions")
        assert r.status_code == 200
        sessions = r.json()
        assert isinstance(sessions, list)
        assert any(s["session_id"] == TestAIMentor.session_id for s in sessions)

    def test_session_history(self, student_session):
        sid = TestAIMentor.session_id
        assert sid
        r = student_session.get(f"{API}/ai-mentor/history/{sid}")
        assert r.status_code == 200
        msgs = r.json()
        assert len(msgs) >= 2  # user + assistant
        assert msgs[0]["role"] == "user"
