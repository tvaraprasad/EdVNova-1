# Iteration 26: Chemistry 9701 unified curriculum in isolated STAGING (edvnova_chem_staging via /staging/api).
# Only read-only calls are made against the main /api.
import os
import uuid
import pytest
import requests
from urllib.parse import urlparse


def _env(path, key):
    for line in open(path):
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"')


BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or _env("/app/frontend/.env", "REACT_APP_BACKEND_URL")).rstrip("/")
STAGING_KEY = os.environ.get("STAGING_ACCESS_KEY") or _env("/app/frontend/.env", "STAGING_ACCESS_KEY")
HOST = urlparse(BASE_URL).hostname
S = f"{BASE_URL}/staging/api"
EQ = {"board": "as-level", "subject": "chemistry", "chapter": "chemical-equilibria", "topic": "equilibrium-constants"}


def staging_session():
    s = requests.Session()
    s.cookies.set("edv_staging", STAGING_KEY, domain=HOST, path="/")
    return s


def new_student(prefix):
    s = staging_session()
    email = f"TEST_{prefix}_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{S}/auth/register", json={"email": email, "password": "Test@12345", "name": "TEST Chem"})
    assert r.status_code in (200, 201), r.text
    assert s.get(f"{S}/auth/me").status_code == 200
    return s


# --- Isolation ---
class TestIsolation:
    def test_no_cookie_forbidden(self):
        assert requests.get(f"{S}/").status_code == 403

    def test_wrong_cookie_forbidden(self):
        r = requests.get(f"{S}/", cookies={"edv_staging": "nope"})
        assert r.status_code == 403

    def test_with_cookie_ok(self):
        r = staging_session().get(f"{S}/")
        assert r.status_code == 200 and "message" in r.json()

    def test_main_db_untouched_alevel_chem(self):
        d = requests.get(f"{BASE_URL}/api/progress/course/a-level/chemistry").json()
        assert [c["name"] for c in d["chapters"]] == ["Reaction Kinetics", "Chemical Equilibria Advanced", "Organic Chemistry Advanced", "Analytical Chemistry"]


# --- Course structure ---
class TestStructure:
    def test_as_level_22(self):
        d = staging_session().get(f"{S}/progress/course/as-level/chemistry").json()
        assert [c["syllabus_number"] for c in d["chapters"]] == [str(i) for i in range(1, 23)]
        assert all(c["board"] == "as-level" and c["kind"] != "practical" for c in d["chapters"])

    def test_a_level_37_grouped(self):
        d = staging_session().get(f"{S}/progress/course/a-level/chemistry").json()
        chs = d["chapters"]
        assert [c["syllabus_number"] for c in chs] == [str(i) for i in range(1, 38)]
        assert all(c["group"] == "AS Foundation" and c["board"] == "as-level" for c in chs[:22])
        assert all(c["group"] == "A Level Extension" and c["board"] == "a-level" for c in chs[22:])
        assert not any(c["kind"] == "practical" for c in chs)

    def test_chapter_fallback_and_needs_review_hidden(self):
        d = staging_session().get(f"{S}/curriculum/boards/a-level/chemistry/atomic-structure").json()
        assert d["board_slug"] == "as-level"
        slugs = [t["slug"] for t in d["topics"]]
        assert "orbitals" not in slugs and len(slugs) > 0

    def test_subject_page_alevel_lists_37(self):
        d = staging_session().get(f"{S}/curriculum/boards/a-level/chemistry").json()
        assert len(d["chapters"]) == 37

    def test_draft_topic_not_openable(self):
        # Requirement: drafts never openable. Public topic endpoint should not serve draft/needs_review topics.
        r = staging_session().get(f"{S}/curriculum/boards/a-level/chemistry/atomic-structure/orbitals")
        assert r.status_code == 404, f"needs_review draft served: {r.status_code}"


# --- Shared progress between AS and A Level views ---
class TestSharedProgress:
    def test_shared_progress(self):
        s = new_student("chemshare")
        r = s.post(f"{S}/progress/visit", json={**EQ, "view_board": "as-level"})
        assert r.status_code == 200 and r.json()["status"] == "in_progress"
        r = s.post(f"{S}/progress/complete", json=EQ)
        assert r.status_code == 200 and r.json()["newly_completed"] is True
        as_c = s.get(f"{S}/progress/course/as-level/chemistry").json()
        a_c = s.get(f"{S}/progress/course/a-level/chemistry").json()
        assert (as_c["completed"], as_c["total"], as_c["percent"]) == (1, 1, 100)
        assert a_c["completed"] == as_c["completed"]
        ch = next(c for c in a_c["chapters"] if c["slug"] == "chemical-equilibria")
        assert ch["topics"][0]["status"] == "completed"
        cont = s.get(f"{S}/progress/continue").json()["courses"]
        assert [c["board"] for c in cont] == ["as-level"]
        # visiting via A Level view regroups the continue card
        s.post(f"{S}/progress/visit", json={**EQ, "view_board": "a-level"})
        cont = s.get(f"{S}/progress/continue").json()["courses"]
        assert cont[0]["board"] == "a-level" and cont[0]["completed"] == 1


# --- Subtopic negatives ---
class TestSubtopicNegatives:
    def test_anonymous_401(self):
        r = staging_session().post(f"{S}/progress/subtopic", json={**EQ, "subtopic": "equilibrium-constant-kc"})
        assert r.status_code == 401

    def test_before_visit_400_and_unknown_404(self):
        s = new_student("chemsubneg")
        r = s.post(f"{S}/progress/subtopic", json={**EQ, "subtopic": "equilibrium-constant-kc"})
        assert r.status_code == 400
        s.post(f"{S}/progress/visit", json={**EQ, "view_board": "a-level"})
        r = s.post(f"{S}/progress/subtopic", json={**EQ, "subtopic": "does-not-exist"})
        assert r.status_code == 404
        r = s.post(f"{S}/progress/subtopic", json={**EQ, "subtopic": "reversible-reactions"})
        assert r.status_code == 200 and "reversible-reactions" in r.json()["subtopics_completed"]

    def test_draft_lesson_visit_404(self):
        s = new_student("chemdraft")
        r = s.post(f"{S}/progress/visit", json={"board": "as-level", "subject": "chemistry", "chapter": "atomic-structure", "topic": "isotopes"})
        assert r.status_code == 404
