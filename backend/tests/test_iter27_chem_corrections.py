# Iteration 27: Chemistry minimal corrections in STAGING (course titles, groups, available-only progress, drafts 404).
# Staging is reached via public URL + edv_staging cookie (/staging/api). Main /api is GET-only.
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
STAGING_KEY = os.environ.get("STAGING_ACCESS_KEY") or _env("/app/frontend/.env", "STAGING_ACCESS_KEY") or "wYdRCVUFkXSW0ZADenrCK7oe"
HOST = urlparse(BASE_URL).hostname
S = f"{BASE_URL}/staging/api"
EQ = {"board": "as-level", "subject": "chemistry", "chapter": "chemical-equilibria", "topic": "equilibrium-constants"}
DRAFT = {"board": "as-level", "subject": "chemistry", "chapter": "practical-skills-p3", "topic": "laboratory-techniques"}
EMPTY = {"board": "igcse", "subject": "mathematics", "chapter": "number", "topic": "fractions"}
CREATED_USERS = []


def staging_session():
    s = requests.Session()
    s.cookies.set("edv_staging", STAGING_KEY, domain=HOST, path="/")
    return s


@pytest.fixture(scope="module")
def student():
    s = staging_session()
    email = f"TEST_iter27_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{S}/auth/register", json={"email": email, "password": "Test@12345", "name": "TEST Iter27"})
    assert r.status_code in (200, 201), r.text
    me = s.get(f"{S}/auth/me").json()
    CREATED_USERS.append(me.get("id") or me.get("_id") or email)
    print("CREATED_USER", email, me.get("id"))
    return s


@pytest.fixture(scope="module")
def admin():
    s = staging_session()
    r = s.post(f"{S}/auth/login", json={"email": "admin@edvnova.com", "password": "Admin@123"})
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}")
    return s


def course(board, sess=None):
    return (sess or staging_session()).get(f"{S}/progress/course/{board}/chemistry").json()


# --- Structure ---
class TestStructure:
    def test_as_level(self):
        d = course("as-level")
        assert d["course_title"] == "AS Level Chemistry"
        nums = [c["syllabus_number"] for c in d["chapters"]]
        assert nums == [str(i) for i in range(1, 23)] + ["P3"]

    def test_a_level_groups(self):
        d = course("a-level")
        assert d["course_title"] == "Full A Level Chemistry"
        ch = d["chapters"]
        asf = [c for c in ch if c["group"] == "AS Foundation"]
        ext = [c for c in ch if c["group"] == "A Level Extension"]
        prac = [c for c in ch if c["group"] == "Practical skills"]
        assert [c["syllabus_number"] for c in asf] == [str(i) for i in range(1, 23)] and all(c["board"] == "as-level" for c in asf)
        assert [c["syllabus_number"] for c in ext] == [str(i) for i in range(23, 38)] and all(c["board"] == "a-level" for c in ext)
        assert [(c["syllabus_number"], c["board"]) for c in prac] == [("P3", "as-level"), ("P5", "a-level")]

    def test_7_1_same_record_both_views(self):
        a = next(c for c in course("as-level")["chapters"] if c["slug"] == "chemical-equilibria")
        b = next(c for c in course("a-level")["chapters"] if c["slug"] == "chemical-equilibria")
        assert a["board"] == b["board"] == "as-level"
        ta, tb = a["topics"], b["topics"]
        assert ta == tb
        eq = next(t for t in ta if t["slug"] == "equilibrium-constants")
        assert eq["title"] == "Equilibrium Constants" and eq["syllabus_title"] == "Chemical equilibria" and eq["syllabus_ref"] == "7.1"

    def test_only_eq_available(self):
        for board in ("as-level", "a-level"):
            avail = [(c["slug"], t["slug"]) for c in course(board)["chapters"] for t in c["topics"] if t["available"]]
            assert avail == [("chemical-equilibria", "equilibrium-constants")], avail
            d = course(board)
            assert d["total"] == 1
            for c in d["chapters"]:
                for t in c["topics"]:
                    if not t["available"]:
                        assert t["status"] == "unavailable" and t["subtopics"] == []

    def test_chapter_endpoint_available_flag(self):
        s = staging_session()
        d = s.get(f"{S}/curriculum/boards/as-level/chemistry/chemical-equilibria").json()
        assert all(isinstance(t["available"], bool) for t in d["topics"])
        assert {t["slug"]: t["available"] for t in d["topics"]}.get("equilibrium-constants") is True
        p3 = s.get(f"{S}/curriculum/boards/as-level/chemistry/practical-skills-p3").json()
        assert p3["topics"] and not any(t["available"] for t in p3["topics"])
        # a-level view falls back to as-level chapter
        al = s.get(f"{S}/curriculum/boards/a-level/chemistry/chemical-equilibria").json()
        assert al["board_slug"] == "as-level"


# --- Draft access ---
class TestDraftAccess:
    URL = "/curriculum/boards/as-level/chemistry/practical-skills-p3/laboratory-techniques"

    def test_anon_404(self):
        assert staging_session().get(S + self.URL).status_code == 404

    def test_student_404(self, student):
        assert student.get(S + self.URL).status_code == 404

    def test_admin_200(self, admin):
        r = admin.get(S + self.URL)
        assert r.status_code == 200 and r.json()["status"] == "draft"


# --- Progress gating ---
class TestProgress:
    @pytest.mark.parametrize("ref", [DRAFT, EMPTY], ids=["draft", "published_empty"])
    def test_visit_complete_404(self, student, ref):
        assert student.post(f"{S}/progress/visit", json=ref).status_code == 404
        assert student.post(f"{S}/progress/complete", json=ref).status_code == 404
        assert student.post(f"{S}/progress/subtopic", json={**ref, "subtopic": "x"}).status_code == 404

    def test_visit_complete_eq(self, student):
        r = student.post(f"{S}/progress/visit", json={**EQ, "view_board": "a-level"})
        assert r.status_code == 200 and r.json()["status"] == "in_progress"
        r = student.post(f"{S}/progress/complete", json=EQ)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "completed" and body["course"]["total"] == 1 and body["course"]["completed"] == 1
        al = course("a-level", student)
        assert al["total"] == 1 and al["completed"] == 1 and al["percent"] == 100
        cont = student.get(f"{S}/progress/continue").json()["courses"]
        assert cont and cont[0]["board"] == "a-level" and cont[0]["course_title"] == "Full A Level Chemistry"


# --- Main site sanity (GET only) ---
class TestMain:
    def test_main_a_level_chem(self):
        d = requests.get(f"{BASE_URL}/api/progress/course/a-level/chemistry").json()
        assert d["course_title"] == "A Level Chemistry"
        assert [c["name"] for c in d["chapters"]] == ["Reaction Kinetics", "Chemical Equilibria Advanced", "Organic Chemistry Advanced", "Analytical Chemistry"]
