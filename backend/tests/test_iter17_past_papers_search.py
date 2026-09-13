"""Iteration 17: Past Papers + Global Search API tests."""
import io
import os
import pytest
import requests
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://igcse-elite.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASS = ADMIN_PASSWORD


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def uploaded_paper_id(admin_session):
    files = {"file": ("0580_s24_qp_22.pdf", io.BytesIO(b"%PDF-1.4 test past paper content"), "application/pdf")}
    r = admin_session.post(f"{API}/past-papers/upload", files=files, timeout=30)
    assert r.status_code == 200, f"Upload failed: {r.status_code} {r.text}"
    data = r.json()
    assert "id" in data and "file_url" in data and "inferred" in data
    inf = data["inferred"].get("inferred", {})
    assert inf.get("syllabus_code") == "0580"
    assert inf.get("year") == 2024
    assert inf.get("session") == "May/Jun"
    assert inf.get("resource_type") == "question_paper"
    assert inf.get("paper") == 2
    assert inf.get("variant") == 2
    assert inf.get("qualification") == "igcse"
    return data["id"]


class TestPastPapers:
    def test_single_upload_and_infer(self, uploaded_paper_id):
        assert uploaded_paper_id

    def test_bulk_upload(self, admin_session):
        files = [
            ("files", ("0620_w23_ms_31.pdf", io.BytesIO(b"pdf-a"), "application/pdf")),
            ("files", ("0625_m22_qp_12.pdf", io.BytesIO(b"pdf-b"), "application/pdf")),
        ]
        r = admin_session.post(f"{API}/past-papers/bulk-upload", files=files, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("uploaded") == 2
        assert len(data.get("papers", [])) == 2
        # Verify one inference
        first = data["papers"][0]
        assert first["inferred"].get("syllabus_code") in ("0620", "0625")
        assert first["confidence"] == "high"

    def test_browse_papers(self, uploaded_paper_id):
        r = requests.get(f"{API}/past-papers/browse?syllabus_code=0580&year=2024", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["total"] >= 1
        assert any(p["id"] == uploaded_paper_id for p in data["papers"])
        p0 = data["papers"][0]
        assert "_id" not in p0
        assert "id" in p0

    def test_browse_pagination(self):
        r = requests.get(f"{API}/past-papers/browse?page=1&limit=5", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["page"] == 1
        assert len(d["papers"]) <= 5

    def test_filters_endpoint(self):
        r = requests.get(f"{API}/past-papers/filters", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ("qualifications", "subjects", "syllabus_codes", "years", "sessions"):
            assert k in d and isinstance(d[k], list)
        assert "0580" in d["syllabus_codes"]
        assert 2024 in d["years"]

    def test_stats_requires_admin(self):
        r = requests.get(f"{API}/past-papers/stats", timeout=15)
        assert r.status_code in (401, 403)

    def test_stats_admin(self, admin_session):
        r = admin_session.get(f"{API}/past-papers/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] >= 1
        assert "pending_review" in d and "approved" in d and "by_qualification" in d

    def test_update_paper(self, admin_session, uploaded_paper_id):
        r = admin_session.put(f"{API}/past-papers/admin/{uploaded_paper_id}",
                              json={"title": "TEST_Updated Title", "review_status": "approved"}, timeout=15)
        assert r.status_code == 200
        # Verify via browse
        r2 = requests.get(f"{API}/past-papers/browse?syllabus_code=0580", timeout=15)
        found = [p for p in r2.json()["papers"] if p["id"] == uploaded_paper_id]
        assert found and found[0]["title"] == "TEST_Updated Title"
        assert found[0]["review_status"] == "approved"

    def test_bulk_approve(self, admin_session, uploaded_paper_id):
        r = admin_session.put(f"{API}/past-papers/admin/bulk-approve",
                              json={"paper_ids": [uploaded_paper_id]}, timeout=15)
        assert r.status_code == 200
        assert "approved" in r.json()

    def test_delete_paper(self, admin_session, uploaded_paper_id):
        r = admin_session.delete(f"{API}/past-papers/admin/{uploaded_paper_id}", timeout=15)
        assert r.status_code == 200
        # Verify not in browse (soft delete)
        r2 = requests.get(f"{API}/past-papers/browse?syllabus_code=0580", timeout=15)
        assert not any(p["id"] == uploaded_paper_id for p in r2.json()["papers"])


class TestSearch:
    def test_search_short_query(self):
        r = requests.get(f"{API}/search?q=a", timeout=15)
        assert r.status_code == 200
        assert r.json()["total"] == 0

    def test_search_topic(self):
        r = requests.get(f"{API}/search?q=quadratic", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "results" in d
        # If topics exist, at least verify structure
        for res in d["results"]:
            assert "type" in res and "title" in res and "url" in res
            assert "_id" not in res

    def test_search_by_code(self, admin_session):
        # Upload a paper first to ensure something is searchable
        files = {"file": ("0580_w24_qp_11.pdf", io.BytesIO(b"pdf-search"), "application/pdf")}
        u = admin_session.post(f"{API}/past-papers/upload", files=files, timeout=30)
        assert u.status_code == 200
        pid = u.json()["id"]
        try:
            r = requests.get(f"{API}/search?q=0580", timeout=15)
            assert r.status_code == 200
            d = r.json()
            types = {res["type"] for res in d["results"]}
            assert "past_paper" in types
        finally:
            admin_session.delete(f"{API}/past-papers/admin/{pid}", timeout=15)
