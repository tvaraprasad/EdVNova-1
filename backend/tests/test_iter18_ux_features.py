"""
Iteration 18 tests:
- Global Search API with categories + code-pattern detection
- Past Papers SEO routes: /collection, /page, /paper/{id}
"""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASS = "Admin@123"


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return s


# -------- Search API --------
class TestSearchAPI:
    def test_search_text_returns_categories(self):
        r = requests.get(f"{API}/search", params={"q": "quadratic"})
        assert r.status_code == 200
        data = r.json()
        assert "results" in data and "total" in data and "query" in data
        assert isinstance(data["results"], list)
        # Every result must have a category
        for item in data["results"]:
            assert "category" in item
            assert item["category"] in {"Learn", "Practise", "Exam"}

    def test_search_code_pattern_0580(self):
        r = requests.get(f"{API}/search", params={"q": "0580"})
        assert r.status_code == 200
        data = r.json()
        # Should be a well-formed response (may have zero past-paper hits if DB empty)
        assert "results" in data
        for item in data["results"]:
            assert "type" in item and "url" in item

    def test_search_code_with_paper_and_year(self):
        r = requests.get(f"{API}/search", params={"q": "9701/31 2022"})
        assert r.status_code == 200
        data = r.json()
        assert "results" in data

    def test_search_short_query_returns_empty(self):
        r = requests.get(f"{API}/search", params={"q": "a"})
        assert r.status_code == 200
        assert r.json()["results"] == []


# -------- Past Papers SEO routes --------
class TestPastPapersSEO:
    def test_collection_shape(self):
        r = requests.get(f"{API}/past-papers/collection/igcse/0625")
        assert r.status_code == 200
        data = r.json()
        for k in ["qualification", "syllabus_code", "subject", "total", "years", "sessions", "papers"]:
            assert k in data, f"Missing key {k}"
        assert data["qualification"] == "igcse"
        assert data["syllabus_code"] == "0625"
        assert isinstance(data["years"], list)
        assert isinstance(data["papers"], list)

    def test_collection_unknown_still_ok(self):
        r = requests.get(f"{API}/past-papers/collection/igcse/9999")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 0

    def test_page_not_found(self):
        r = requests.get(f"{API}/past-papers/page/igcse/0625/2024/may-jun/paper-22/question-paper")
        # Should return 404 (or 200 if data seeded) — must not 500
        assert r.status_code in (200, 404)

    def test_single_paper_invalid_id(self):
        r = requests.get(f"{API}/past-papers/paper/invalidid")
        assert r.status_code == 400

    def test_single_paper_notfound(self):
        # A valid-format ObjectId but not present
        r = requests.get(f"{API}/past-papers/paper/507f1f77bcf86cd799439011")
        assert r.status_code == 404


# -------- End-to-end with seeded past paper --------
class TestPastPaperE2E:
    """Upload a past paper and verify all SEO endpoints and search find it."""

    @pytest.fixture(scope="class")
    def seeded_paper(self, admin_session):
        # Upload a Cambridge-style file
        files = {"file": ("0625_s24_qp_11.pdf", io.BytesIO(b"%PDF-1.4 dummy"), "application/pdf")}
        data = {"curriculum": "cambridge", "title": "TEST_iter18_paper"}
        r = admin_session.post(f"{API}/past-papers/upload", files=files, data=data)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        yield pid
        # cleanup
        admin_session.delete(f"{API}/past-papers/admin/{pid}")

    def test_collection_contains_paper(self, seeded_paper):
        r = requests.get(f"{API}/past-papers/collection/igcse/0625")
        assert r.status_code == 200
        d = r.json()
        assert d["total"] >= 1
        ids = [p["id"] for p in d["papers"]]
        assert seeded_paper in ids

    def test_page_route_returns_paper(self, seeded_paper):
        r = requests.get(f"{API}/past-papers/page/igcse/0625/2024/may-jun/paper-1/question-paper")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "paper" in d and "related" in d
        assert d["paper"]["syllabus_code"] == "0625"

    def test_single_paper_by_id(self, seeded_paper):
        r = requests.get(f"{API}/past-papers/paper/{seeded_paper}")
        assert r.status_code == 200
        d = r.json()
        assert d["paper"]["id"] == seeded_paper
        assert "related" in d

    def test_search_code_finds_paper(self, seeded_paper):
        r = requests.get(f"{API}/search", params={"q": "0625"})
        assert r.status_code == 200
        results = r.json()["results"]
        # At least one Exam category result expected
        exam_results = [x for x in results if x.get("category") == "Exam"]
        assert len(exam_results) >= 1
