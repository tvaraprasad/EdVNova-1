"""Backend tests for Phase B: Videos, Media Library, Question ID system."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://igcse-elite.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASS = "Admin@123"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text[:200]}")
    return s


# ─────── Videos API ───────
class TestVideosAdmin:
    def test_admin_stats(self, admin_session):
        r = admin_session.get(f"{API}/videos/admin/stats")
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ["total", "available", "coming_soon", "by_subject"]:
            assert k in data
        assert isinstance(data["by_subject"], dict)
        assert "physics" in data["by_subject"]

    def test_admin_list_basic(self, admin_session):
        r = admin_session.get(f"{API}/videos/admin/list")
        assert r.status_code == 200
        d = r.json()
        assert "videos" in d and "total" in d
        assert isinstance(d["videos"], list)

    def test_admin_list_filters(self, admin_session):
        r = admin_session.get(f"{API}/videos/admin/list?subject=physics&board=igcse")
        assert r.status_code == 200
        for v in r.json()["videos"]:
            assert v["subject"] == "physics"
            assert v["board"] == "igcse"

    def test_create_update_delete_video_flow(self, admin_session):
        # CREATE
        payload = {
            "title": "TEST_Video_PhaseB",
            "description": "Automated test video",
            "board": "igcse",
            "subject": "physics",
            "chapter": "electricity",
            "topic": "Resistance",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "duration": "10:30",
            "difficulty": "medium",
            "status": "available",
            "order": 99,
        }
        r = admin_session.post(f"{API}/videos/admin/create", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d
        vid = d["id"]

        # GET via admin list (search)
        r2 = admin_session.get(f"{API}/videos/admin/list?q=TEST_Video_PhaseB")
        assert r2.status_code == 200
        titles = [v["title"] for v in r2.json()["videos"]]
        assert "TEST_Video_PhaseB" in titles

        # UPDATE
        r3 = admin_session.put(f"{API}/videos/admin/{vid}", json={"title": "TEST_Video_PhaseB_v2", "status": "coming_soon"})
        assert r3.status_code == 200, r3.text

        # verify chapter endpoint (public) shouldn't require auth
        pub = requests.get(f"{API}/videos/chapter/igcse/physics/electricity")
        assert pub.status_code == 200
        assert isinstance(pub.json(), list)

        # verify update persisted (via admin list)
        r4 = admin_session.get(f"{API}/videos/admin/list?q=TEST_Video_PhaseB_v2")
        assert r4.status_code == 200
        found = [v for v in r4.json()["videos"] if v["id"] == vid]
        assert len(found) == 1
        assert found[0]["title"] == "TEST_Video_PhaseB_v2"
        assert found[0]["status"] == "coming_soon"

        # DELETE
        r5 = admin_session.delete(f"{API}/videos/admin/{vid}")
        assert r5.status_code == 200

        # verify gone
        r6 = admin_session.get(f"{API}/videos/admin/list?q=TEST_Video_PhaseB_v2")
        assert r6.status_code == 200
        assert not any(v["id"] == vid for v in r6.json()["videos"])

    def test_chapter_videos_public(self):
        r = requests.get(f"{API}/videos/chapter/igcse/physics/electricity")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_browse_public(self):
        r = requests.get(f"{API}/videos/browse?subject=physics")
        assert r.status_code == 200
        d = r.json()
        assert "videos" in d and "total" in d
        # Default browse should only include available/coming_soon
        for v in d["videos"]:
            assert v["status"] in ["available", "coming_soon"]

    def test_admin_delete_invalid_id(self, admin_session):
        r = admin_session.delete(f"{API}/videos/admin/invalid-id")
        assert r.status_code == 400

    def test_admin_update_not_found(self, admin_session):
        # valid ObjectId format but non-existent
        r = admin_session.put(f"{API}/videos/admin/507f1f77bcf86cd799439011", json={"title": "x"})
        assert r.status_code == 404


# ─────── Media API ───────
class TestMedia:
    def test_upload_list_delete_flow(self, admin_session):
        # UPLOAD (multipart -> different content-type; use new requests call)
        files = {"file": ("TEST_phaseB.txt", io.BytesIO(b"hello phase b"), "text/plain")}
        data = {"folder": "test_folder"}
        # Copy cookies from admin_session
        r = requests.post(f"{API}/media/upload", files=files, data=data, cookies=admin_session.cookies)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "id" in j and "file_url" in j and "filename" in j
        assert j["file_url"].startswith("/api/uploads/media/test_folder/")
        fid = j["id"]

        # LIST
        lr = admin_session.get(f"{API}/media/list?folder=test_folder")
        assert lr.status_code == 200
        ld = lr.json()
        assert ld["total"] >= 1
        assert any(f["id"] == fid for f in ld["files"])

        # SEARCH
        sr = admin_session.get(f"{API}/media/list?q=TEST_phaseB")
        assert sr.status_code == 200
        assert any(f["id"] == fid for f in sr.json()["files"])

        # FOLDERS
        fr = admin_session.get(f"{API}/media/folders")
        assert fr.status_code == 200
        folders = fr.json()
        assert isinstance(folders, list)
        names = [f["name"] for f in folders]
        assert "test_folder" in names

        # DELETE
        dr = admin_session.delete(f"{API}/media/{fid}")
        assert dr.status_code == 200

        # verify gone
        lr2 = admin_session.get(f"{API}/media/list?folder=test_folder")
        assert not any(f["id"] == fid for f in lr2.json()["files"])

    def test_delete_invalid_id(self, admin_session):
        r = admin_session.delete(f"{API}/media/invalid")
        assert r.status_code == 400

    def test_delete_nonexistent(self, admin_session):
        r = admin_session.delete(f"{API}/media/507f1f77bcf86cd799439011")
        assert r.status_code == 404

    def test_list_requires_admin(self):
        r = requests.get(f"{API}/media/list")
        assert r.status_code in [401, 403]


# ─────── Question ID System ───────
class TestQuestionIds:
    def test_browse_has_question_id(self):
        r = requests.get(f"{API}/questions/browse?subject=physics&board=igcse&limit=20")
        assert r.status_code == 200
        qs = r.json()["questions"]
        assert len(qs) > 0
        # All existing 17 questions should have question_id backfilled
        for q in qs:
            assert "question_id" in q, f"question missing question_id: {q.get('topic')}"
            assert q["question_id"], f"question_id empty for: {q.get('topic')}"

    def test_all_questions_have_ids(self):
        # Iterate across all subjects
        total_qs = 0
        missing = []
        for subj in ["physics", "chemistry", "biology", "mathematics"]:
            r = requests.get(f"{API}/questions/browse?subject={subj}&limit=100")
            assert r.status_code == 200
            for q in r.json()["questions"]:
                total_qs += 1
                if not q.get("question_id"):
                    missing.append(q.get("id"))
        assert total_qs >= 17, f"expected at least 17 questions, got {total_qs}"
        assert not missing, f"{len(missing)} questions missing question_id: {missing[:5]}"

    def test_id_format(self):
        r = requests.get(f"{API}/questions/browse?subject=physics&limit=20")
        assert r.status_code == 200
        for q in r.json()["questions"]:
            qid = q["question_id"]
            # Expected format: X-XX-NNN e.g., P-EL-001
            parts = qid.split("-")
            assert len(parts) == 3, f"bad id format: {qid}"
            assert parts[0] == "P", f"physics id should start with P: {qid}"
            assert parts[2].isdigit() and len(parts[2]) == 3, f"bad numeric part: {qid}"

    def test_create_question_auto_generates_id(self, admin_session):
        payload = {
            "subject": "physics",
            "board": "igcse",
            "topic": "Electricity",
            "chapter": "electricity",
            "difficulty": "easy",
            "paper_type": "structured",
            "question_text": "TEST_PhaseB auto id generation question",
            "marks": 1,
        }
        r = admin_session.post(f"{API}/questions/admin/create", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "question_id" in d
        assert d["question_id"], "question_id should be auto-generated"
        # Should start with P- for physics
        assert d["question_id"].startswith("P-"), f"unexpected id: {d['question_id']}"
        qid = d["id"]

        # cleanup
        admin_session.delete(f"{API}/questions/admin/{qid}")

    def test_create_question_with_custom_id(self, admin_session):
        payload = {
            "subject": "physics",
            "board": "igcse",
            "topic": "Electricity",
            "difficulty": "easy",
            "paper_type": "structured",
            "question_text": "TEST_PhaseB custom id question",
            "marks": 1,
            "question_id": "P-TEST-999",
        }
        r = admin_session.post(f"{API}/questions/admin/create", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["question_id"] == "P-TEST-999"
        admin_session.delete(f"{API}/questions/admin/{d['id']}")
