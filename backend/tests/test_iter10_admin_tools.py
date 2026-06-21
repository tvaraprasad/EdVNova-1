"""Backend tests for iteration 10: Chapter Notes Editor, Worksheet Manager,
and Bulk Question Import admin tools."""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


# ── Chapter Notes Editor ──
class TestChapterNotesEditor:
    def test_admin_chapters_list(self, admin_session):
        r = admin_session.get(f"{API}/curriculum/admin/chapters",
                              params={"board": "igcse", "subject": "physics"}, timeout=15)
        assert r.status_code == 200
        chapters = r.json()
        assert isinstance(chapters, list)
        assert len(chapters) >= 1, f"Expected chapters list, got {chapters}"
        # spec says 9 chapters
        print(f"Physics IGCSE chapters: {len(chapters)} -> {[c['slug'] for c in chapters]}")
        slugs = [c["slug"] for c in chapters]
        assert "electricity" in slugs, f"electricity chapter missing in {slugs}"

    def test_admin_chapter_topics_electricity(self, admin_session):
        r = admin_session.get(f"{API}/curriculum/admin/chapter-topics",
                              params={"board": "igcse", "subject": "physics", "chapter": "electricity"},
                              timeout=15)
        assert r.status_code == 200
        topics = r.json()
        assert isinstance(topics, list)
        assert len(topics) == 5, f"Expected 5 topics for electricity, got {len(topics)}"
        titles = [t["title"] for t in topics]
        print(f"Electricity topics: {titles}")
        # Each topic should have id and content
        for t in topics:
            assert "id" in t
            assert "_id" not in t
            assert "content" in t
            assert "status" in t

    def test_admin_chapter_topics_resistance_published(self, admin_session):
        r = admin_session.get(f"{API}/curriculum/admin/chapter-topics",
                              params={"board": "igcse", "subject": "physics", "chapter": "electricity"},
                              timeout=15)
        topics = r.json()
        resistance = next((t for t in topics if "resistance" in t["slug"].lower() or "Resistance" in t["title"]), None)
        assert resistance is not None, "Resistance topic not found"
        assert resistance.get("status") == "published", f"Resistance status: {resistance.get('status')}"

    def test_bulk_publish_topics(self, admin_session):
        # Pick a draft topic from a different chapter to bulk-publish
        chapters_r = admin_session.get(f"{API}/curriculum/admin/chapters",
                                       params={"board": "igcse", "subject": "physics"})
        chapters = chapters_r.json()
        # find some draft
        target_id = None
        original_status = None
        for ch in chapters:
            tr = admin_session.get(f"{API}/curriculum/admin/chapter-topics",
                                   params={"board": "igcse", "subject": "physics", "chapter": ch["slug"]})
            for t in tr.json():
                if t.get("status") == "draft":
                    target_id = t["id"]
                    original_status = "draft"
                    break
            if target_id:
                break
        if not target_id:
            pytest.skip("No draft topic available to bulk publish")
        r = admin_session.put(f"{API}/curriculum/admin/topics/bulk-publish",
                              json={"topic_ids": [target_id]}, timeout=15)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        assert data.get("count", 0) >= 1
        # revert
        admin_session.put(f"{API}/curriculum/admin/topics/{target_id}",
                          json={"status": original_status})


# ── Worksheet Manager ──
class TestWorksheetManager:
    created_id = None

    def test_admin_worksheet_stats(self, admin_session):
        r = admin_session.get(f"{API}/worksheets/admin/stats", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "by_subject" in data

    def test_admin_worksheet_upload(self, admin_session):
        # Upload a fake PDF
        files = {"file": ("TEST_worksheet.pdf", io.BytesIO(b"%PDF-1.4 fake content"), "application/pdf")}
        data = {
            "title": "TEST_Worksheet_Iter10",
            "subject": "physics",
            "board": "igcse",
            "chapter": "Electricity",
            "topic": "Current",
            "description": "Test upload",
            "is_free": "true",
        }
        r = admin_session.post(f"{API}/worksheets/admin/upload", files=files, data=data, timeout=30)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        body = r.json()
        assert "id" in body
        assert "file_url" in body
        assert body["file_url"].startswith("/api/uploads/worksheets/")
        TestWorksheetManager.created_id = body["id"]

    def test_admin_worksheet_list(self, admin_session):
        r = admin_session.get(f"{API}/worksheets/admin/list", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "worksheets" in data
        assert "total" in data
        assert data["total"] >= 1
        ids = [w["id"] for w in data["worksheets"]]
        assert TestWorksheetManager.created_id in ids

    def test_public_worksheet_browse(self):
        r = requests.get(f"{API}/worksheets/browse", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "worksheets" in data
        assert isinstance(data["worksheets"], list)

    def test_admin_worksheet_delete_cleanup(self, admin_session):
        if not TestWorksheetManager.created_id:
            pytest.skip("No worksheet to delete")
        r = admin_session.delete(f"{API}/worksheets/admin/{TestWorksheetManager.created_id}", timeout=15)
        assert r.status_code == 200


# ── Bulk Question Import ──
class TestBulkQuestionImport:
    inserted_count = 0

    def test_bulk_import_questions(self, admin_session):
        payload = {
            "questions": [
                {
                    "subject": "physics", "board": "igcse", "topic": "TEST_BulkImport",
                    "chapter": "TEST", "difficulty": "easy", "paper_type": "structured",
                    "question_text": "TEST_Q1: What is Ohm's law?",
                    "answer": "V=IR", "marks": 2,
                },
                {
                    "subject": "chemistry", "board": "igcse", "topic": "TEST_BulkImport",
                    "chapter": "TEST", "difficulty": "medium",
                    "question_text": "TEST_Q2: Define oxidation.",
                    "answer": "Loss of electrons", "marks": 2,
                },
                # one with empty question_text should be skipped
                {"subject": "physics", "board": "igcse", "topic": "TEST_BulkImport", "question_text": "  "},
            ]
        }
        r = admin_session.post(f"{API}/questions/admin/bulk-import", json=payload, timeout=20)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        assert data.get("count") == 2, f"Expected 2 imported (1 skipped), got {data}"
        TestBulkQuestionImport.inserted_count = data["count"]

    def test_bulk_import_empty_returns_400(self, admin_session):
        r = admin_session.post(f"{API}/questions/admin/bulk-import", json={"questions": []})
        assert r.status_code == 400

    def test_imported_questions_visible_in_admin_list(self, admin_session):
        r = admin_session.get(f"{API}/questions/admin/list",
                              params={"q": "TEST_Q1"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 1
        # cleanup
        for q in data["questions"]:
            if q.get("question_text", "").startswith("TEST_Q"):
                admin_session.delete(f"{API}/questions/admin/{q['id']}")
        # also cleanup Q2
        r2 = admin_session.get(f"{API}/questions/admin/list", params={"q": "TEST_Q2"})
        for q in r2.json().get("questions", []):
            if q.get("question_text", "").startswith("TEST_Q"):
                admin_session.delete(f"{API}/questions/admin/{q['id']}")


# ── Regression: existing pages ──
class TestRegressionPages:
    @pytest.mark.parametrize("path", ["/", "/practice", "/resources", "/boards", "/igcse", "/admin", "/dashboard"])
    def test_frontend_routes_return_html(self, path):
        # frontend SPA - any GET should return 200 with HTML
        url = f"{BASE_URL}{path}"
        r = requests.get(url, timeout=15)
        assert r.status_code == 200, f"{path} returned {r.status_code}"

    def test_api_curriculum_boards(self):
        r = requests.get(f"{API}/curriculum/boards", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
