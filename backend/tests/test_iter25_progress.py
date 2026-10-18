# Iteration 25: Learning Experience 3.0 Phase 1 - lesson/course/video progress APIs
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
OHMS_VIDEO = "6a53bb2dc74f9a207a632742"
NUM = {"board": "igcse", "subject": "mathematics", "chapter": "number"}


def _student(prefix="prog"):
    s = requests.Session()
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "Test@12345", "name": "TEST Prog"})
    assert r.status_code == 200, r.text
    return s


@pytest.fixture(scope="module")
def sa():
    return _student("progA")


@pytest.fixture(scope="module")
def sb():
    return _student("progB")


def lesson(topic, chapter="number"):
    return {**NUM, "chapter": chapter, "topic": topic}


# --- Visit / complete ---
class TestLessonProgress:
    def test_visit_anon_401(self):
        r = requests.post(f"{API}/progress/visit", json=lesson("fractions"))
        assert r.status_code == 401

    def test_visit_unpublished_404(self, sa):
        assert sa.post(f"{API}/progress/visit", json=lesson("standard-form")).status_code == 404
        assert sa.post(f"{API}/progress/visit", json=lesson("nope-xyz")).status_code == 404

    def test_visit_missing_422(self, sa):
        assert sa.post(f"{API}/progress/visit", json={"board": "igcse"}).status_code == 422

    def test_complete_before_visit_400(self, sa):
        assert sa.post(f"{API}/progress/complete", json=lesson("ratio")).status_code == 400

    def test_anon_course_all_not_started(self):
        r = requests.get(f"{API}/progress/course/igcse/mathematics")
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 6 and d["completed"] == 0
        num = next(c for c in d["chapters"] if c["slug"] == "number")
        assert num["total"] == 3
        sf = next(t for t in num["topics"] if t["slug"] == "standard-form")
        assert sf["status"] == "unavailable" and sf["available"] is False
        assert all(t["status"] in ("not_started", "unavailable") for c in d["chapters"] for t in c["topics"])

    def test_full_flow(self, sa):
        r = sa.post(f"{API}/progress/visit", json=lesson("fractions"))
        assert r.status_code == 200 and r.json()["status"] == "in_progress"
        c = sa.post(f"{API}/progress/complete", json=lesson("fractions")).json()
        assert c["newly_completed"] is True and c["chapter_completed_first_time"] is False
        assert c["course"]["completed"] == 1 and c["course"]["percent"] == 17
        c2 = sa.post(f"{API}/progress/complete", json=lesson("fractions")).json()
        assert c2["newly_completed"] is False and c2["course"]["completed"] == 1
        # visit after complete keeps completed
        assert sa.post(f"{API}/progress/visit", json=lesson("fractions")).json()["status"] == "completed"
        d = sa.get(f"{API}/progress/course/igcse/mathematics").json()
        assert d["next_lesson"]["topic"] == "percentages"
        for t in ("percentages",):
            sa.post(f"{API}/progress/visit", json=lesson(t))
            c = sa.post(f"{API}/progress/complete", json=lesson(t)).json()
            assert c["course"]["completed"] == 2 and c["course"]["percent"] == 33
            assert c["chapter_completed_first_time"] is False
        sa.post(f"{API}/progress/visit", json=lesson("ratio"))
        c = sa.post(f"{API}/progress/complete", json=lesson("ratio")).json()
        assert c["course"]["completed"] == 3 and c["course"]["percent"] == 50
        assert c["chapter_completed_first_time"] is True
        c = sa.post(f"{API}/progress/complete", json=lesson("ratio")).json()
        assert c["chapter_completed_first_time"] is False
        sa.post(f"{API}/progress/visit", json=lesson("ratio"))
        c = sa.post(f"{API}/progress/complete", json=lesson("ratio")).json()
        assert c["chapter_completed_first_time"] is False
        d = sa.get(f"{API}/progress/course/igcse/mathematics").json()
        assert d["next_lesson"]["chapter"] == "algebra" and d["next_lesson"]["topic"] == "expressions"
        assert d["last_visited"]["topic"] == "ratio"

    def test_continue(self, sa):
        r = sa.get(f"{API}/progress/continue")
        assert r.status_code == 200
        cs = r.json()["courses"]
        assert cs[0]["subject"] == "mathematics" and cs[0]["completed"] == 3 and cs[0]["total"] == 6
        assert "chapters" not in cs[0]


# --- Privacy ---
class TestPrivacy:
    def test_b_sees_nothing(self, sa, sb):
        assert sb.get(f"{API}/progress/continue").json()["courses"] == []
        d = sb.get(f"{API}/progress/course/igcse/mathematics").json()
        assert d["completed"] == 0 and d["last_visited"] is None

    def test_user_id_param_ignored(self, sb):
        r = sb.get(f"{API}/progress/continue", params={"user_id": "x"})
        assert r.json()["courses"] == []

    def test_continue_anon_401(self):
        assert requests.get(f"{API}/progress/continue").status_code == 401


# --- Video heartbeat ---
class TestVideo:
    def test_invalid_unknown_anon(self, sa):
        body = {"position": 1, "duration": 200, "intervals": [[0, 1]]}
        assert sa.post(f"{API}/progress/video/bad", json=body).status_code == 400
        assert sa.post(f"{API}/progress/video/000000000000000000000000", json=body).status_code == 404
        assert requests.post(f"{API}/progress/video/{OHMS_VIDEO}", json=body).status_code == 401

    def test_single_full_claim_capped(self):
        s = _student("progV")
        r = s.post(f"{API}/progress/video/{OHMS_VIDEO}", json={"position": 1000, "duration": 1000, "intervals": [[0, 1000]]})
        assert r.status_code == 200, r.text
        d = r.json()
        print(d)
        assert d["completed"] is False and d["watched_percent"] < 20

    def test_quick_repeated_requests_inflation(self):
        s = _student("progV2")
        pcts = []
        for i in range(10):
            r = s.post(f"{API}/progress/video/{OHMS_VIDEO}", json={"position": 1000, "duration": 1000, "intervals": [[0, 1000]]})
            pcts.append(r.json()["watched_percent"])
        print("quick repeated pct:", pcts)
        # 10 requests within a couple of seconds should not exceed ~first budget (135s => 14%) much
        assert pcts[-1] <= 20, f"inflated via rapid requests: {pcts}"

    def test_client_duration_short_bypass(self):
        s = _student("progV3")
        r = s.post(f"{API}/progress/video/{OHMS_VIDEO}", json={"position": 10, "duration": 10, "intervals": [[0, 10]]})
        d = r.json()
        print("short duration claim:", d)
        assert d["completed"] is False, "client-controlled duration lets a 10s claim complete the video"

    def test_video_progress_own_only(self, sb):
        sb.post(f"{API}/progress/video/{OHMS_VIDEO}", json={"position": 30, "duration": 1000, "intervals": [[0, 30]]})
        d = sb.get(f"{API}/progress/videos/igcse/physics/electricity").json()
        assert OHMS_VIDEO in d and d[OHMS_VIDEO]["position"] == 30
        other = _student("progV4")
        assert other.get(f"{API}/progress/videos/igcse/physics/electricity").json() == {}
