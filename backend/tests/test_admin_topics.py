"""Tests for new Admin Topic Editor endpoints and contact email mock."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://igcse-elite.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
               headers={"Content-Type": "application/json"})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


# ===== Contact form (mock email) =====
class TestContact:
    def test_contact_post_success(self):
        r = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Tester One",
            "email": "tester@example.com",
            "phone": "+911234567890",
            "subject": "Demo",
            "message": "Testing mock email for contact form submission"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        # Response should indicate success/message
        assert isinstance(data, dict)
        assert any(k in data for k in ["message", "status", "success", "id"])


# ===== Topics Stats =====
class TestTopicsStats:
    def test_stats_unauth(self):
        r = requests.get(f"{BASE_URL}/api/curriculum/admin/topics-stats")
        assert r.status_code in (401, 403)

    def test_stats_admin(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics-stats")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "total" in data and "published" in data and "draft" in data
        assert data["total"] == 340
        assert data["published"] == 10
        assert data["draft"] == 330
        assert data["published"] + data["draft"] == data["total"]
        assert isinstance(data.get("boards"), list)
        assert isinstance(data.get("subjects"), list)


# ===== Admin Topics List =====
class TestAdminTopicsList:
    def test_list_unauth(self):
        r = requests.get(f"{BASE_URL}/api/curriculum/admin/topics")
        assert r.status_code in (401, 403)

    def test_list_default(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics")
        assert r.status_code == 200
        d = r.json()
        assert "topics" in d and "total" in d and "page" in d and "limit" in d
        assert d["total"] == 340
        assert len(d["topics"]) <= d["limit"]
        # Validate shape of a topic item
        assert "id" in d["topics"][0]
        assert "title" in d["topics"][0]
        assert "status" in d["topics"][0]
        # content field is excluded for list view
        assert "content" not in d["topics"][0]

    def test_filter_status_published(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?status=published&limit=100")
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 10
        assert all(t["status"] == "published" for t in d["topics"])

    def test_filter_status_draft(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?status=draft&limit=5")
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 330
        assert all(t["status"] == "draft" for t in d["topics"])

    def test_filter_board(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?board=igcse&limit=5")
        assert r.status_code == 200
        d = r.json()
        assert d["total"] > 0
        assert all(t["board_slug"] == "igcse" for t in d["topics"])

    def test_filter_board_and_subject(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?board=igcse&subject=chemistry&limit=5")
        assert r.status_code == 200
        d = r.json()
        assert all(t["board_slug"] == "igcse" and t["subject_slug"] == "chemistry" for t in d["topics"])

    def test_search_q(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?q=isotopes")
        assert r.status_code == 200
        d = r.json()
        assert d["total"] >= 1
        assert any("isotope" in t["title"].lower() for t in d["topics"])

    def test_pagination(self, admin_session):
        r1 = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?page=1&limit=5")
        r2 = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?page=2&limit=5")
        assert r1.status_code == 200 and r2.status_code == 200
        ids_1 = {t["id"] for t in r1.json()["topics"]}
        ids_2 = {t["id"] for t in r2.json()["topics"]}
        assert len(ids_1) == 5 and len(ids_2) == 5
        assert ids_1.isdisjoint(ids_2)


# ===== Single admin topic, update, publish toggle =====
class TestAdminTopicCRUD:
    @pytest.fixture(scope="class")
    def draft_topic_id(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?status=draft&limit=1")
        assert r.status_code == 200
        return r.json()["topics"][0]["id"]

    @pytest.fixture(scope="class")
    def published_topic_id(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics?status=published&limit=1")
        assert r.status_code == 200
        return r.json()["topics"][0]["id"]

    def test_get_single_topic(self, admin_session, published_topic_id):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics/{published_topic_id}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == published_topic_id
        assert "content" in d
        assert "title" in d
        assert "_id" not in d

    def test_get_single_topic_404(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics/507f1f77bcf86cd799439011")
        assert r.status_code == 404

    def test_update_topic(self, admin_session, draft_topic_id):
        new_seo = "TEST_SEO_TITLE_EDIT"
        r = admin_session.put(
            f"{BASE_URL}/api/curriculum/admin/topics/{draft_topic_id}",
            json={"seo_title": new_seo, "study_time": "45 min"}
        )
        assert r.status_code == 200, r.text
        # Verify persisted via GET
        g = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics/{draft_topic_id}")
        assert g.status_code == 200
        data = g.json()
        assert data["seo_title"] == new_seo
        assert data["study_time"] == "45 min"

    def test_toggle_publish(self, admin_session, draft_topic_id):
        # Initial status
        g = admin_session.get(f"{BASE_URL}/api/curriculum/admin/topics/{draft_topic_id}")
        initial = g.json()["status"]
        # Toggle
        r = admin_session.put(f"{BASE_URL}/api/curriculum/admin/topics/{draft_topic_id}/publish")
        assert r.status_code == 200
        new_status = r.json()["status"]
        assert new_status != initial
        # Toggle back
        r2 = admin_session.put(f"{BASE_URL}/api/curriculum/admin/topics/{draft_topic_id}/publish")
        assert r2.status_code == 200
        assert r2.json()["status"] == initial
