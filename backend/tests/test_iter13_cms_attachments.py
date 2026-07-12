"""Backend tests for Iteration 13: CMS, Topic Attachments, Media Library upgrade."""
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


@pytest.fixture(scope="module")
def anon_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ─────── CMS API (public) ───────
class TestCMSPublic:
    def test_home_page_has_seven_sections(self, anon_session):
        r = anon_session.get(f"{API}/cms/page/home")
        assert r.status_code == 200, r.text
        data = r.json()
        expected = {"hero", "trust_strip", "choose_path", "boards", "why_different", "testimonials", "final_cta"}
        assert expected.issubset(set(data.keys())), f"missing sections: {expected - set(data.keys())}"
        # Data assertions
        assert "heading" in data["hero"]
        assert isinstance(data["trust_strip"]["items"], list)
        assert len(data["trust_strip"]["items"]) >= 5
        assert isinstance(data["testimonials"]["items"], list)
        assert len(data["testimonials"]["items"]) >= 3

    def test_about_page_three_sections(self, anon_session):
        r = anon_session.get(f"{API}/cms/page/about")
        assert r.status_code == 200
        data = r.json()
        assert {"hero", "mission", "vision"}.issubset(set(data.keys()))
        assert "heading" in data["hero"]
        assert isinstance(data["mission"].get("points", []), list)

    def test_contact_page_two_sections(self, anon_session):
        r = anon_session.get(f"{API}/cms/page/contact")
        assert r.status_code == 200
        data = r.json()
        assert {"hero", "info"}.issubset(set(data.keys()))
        assert data["info"]["email"] == "info@edvnova.com"

    def test_global_footer_section(self, anon_session):
        r = anon_session.get(f"{API}/cms/page/global")
        assert r.status_code == 200
        data = r.json()
        assert "footer" in data
        assert "copyright" in data["footer"]

    def test_get_section_endpoint(self, anon_session):
        r = anon_session.get(f"{API}/cms/section/home/hero")
        assert r.status_code == 200
        data = r.json()
        assert "heading" in data


# ─────── CMS API (admin) ───────
class TestCMSAdmin:
    def test_list_pages_requires_admin(self, anon_session):
        r = anon_session.get(f"{API}/cms/admin/pages")
        assert r.status_code in (401, 403)

    def test_list_pages_returns_four(self, admin_session):
        r = admin_session.get(f"{API}/cms/admin/pages")
        assert r.status_code == 200
        data = r.json()
        pages = {p["page"] for p in data}
        assert {"home", "about", "contact", "global"}.issubset(pages)
        home = next(p for p in data if p["page"] == "home")
        assert len(home["sections"]) >= 7

    def test_admin_get_page(self, admin_session):
        r = admin_session.get(f"{API}/cms/admin/page/home")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert all("id" in s for s in data)
        assert all("_id" not in s for s in data)

    def test_update_home_hero_and_persist(self, admin_session):
        # Get current content
        current = admin_session.get(f"{API}/cms/section/home/hero").json()
        original_heading = current.get("heading")
        try:
            # Update
            new_content = dict(current)
            new_content["heading"] = "TEST_Updated_Heading_iter13"
            r = admin_session.put(
                f"{API}/cms/admin/home/hero",
                json={"content": new_content},
            )
            assert r.status_code == 200, r.text
            # Verify persistence via public endpoint
            fetched = admin_session.get(f"{API}/cms/section/home/hero").json()
            assert fetched["heading"] == "TEST_Updated_Heading_iter13"
        finally:
            # Restore
            new_content["heading"] = original_heading
            admin_session.put(
                f"{API}/cms/admin/home/hero", json={"content": new_content}
            )


# ─────── Topic Attachments ───────
class TestTopicAttachments:
    @pytest.fixture(scope="class")
    def topic_id(self):
        return "TEST_topic_iter13_attach"

    def test_upload_file_attachment(self, admin_session, topic_id):
        files = {
            "file": ("TEST_attach.txt", io.BytesIO(b"hello attachment"), "text/plain"),
        }
        data = {
            "topic_id": topic_id,
            "attachment_type": "document",
            "title": "TEST_Doc",
            "description": "d",
            "is_visible": "true",
        }
        # requests session content-type must be reset for multipart
        s = requests.Session()
        s.cookies = admin_session.cookies
        r = s.post(f"{API}/attachments/upload", files=files, data=data)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "id" in j and "file_url" in j
        pytest.attach_file_id = j["id"]

    def test_add_youtube_embed(self, admin_session, topic_id):
        r = admin_session.post(f"{API}/attachments/embed", json={
            "topic_id": topic_id,
            "attachment_type": "youtube",
            "embed_url": "https://youtube.com/embed/xyz",
            "title": "TEST_Yt",
            "is_visible": True,
        })
        assert r.status_code == 200, r.text
        pytest.attach_embed_id = r.json()["id"]

    def test_list_topic_attachments(self, admin_session, topic_id):
        r = admin_session.get(f"{API}/attachments/topic/{topic_id}")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert len(arr) >= 2
        titles = {a["title"] for a in arr}
        assert "TEST_Doc" in titles

    def test_update_attachment_visibility(self, admin_session):
        aid = getattr(pytest, "attach_file_id", None)
        assert aid is not None
        r = admin_session.put(f"{API}/attachments/{aid}", json={"is_visible": False})
        assert r.status_code == 200
        # verify persisted via visible-only endpoint
        r2 = admin_session.get(f"{API}/attachments/topic/TEST_topic_iter13_attach/visible")
        assert r2.status_code == 200
        visible_ids = {a["id"] for a in r2.json()}
        assert aid not in visible_ids

    def test_delete_attachments_cleanup(self, admin_session):
        for aid_attr in ("attach_file_id", "attach_embed_id"):
            aid = getattr(pytest, aid_attr, None)
            if aid:
                r = admin_session.delete(f"{API}/attachments/{aid}")
                assert r.status_code == 200


# ─────── Media Library Upgrade ───────
class TestMediaUpgrade:
    def test_media_stats(self, admin_session):
        r = admin_session.get(f"{API}/media/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ["total_files", "total_size_bytes", "by_type"]:
            assert k in d
        assert isinstance(d["by_type"], dict)
        assert {"images", "documents", "videos", "other"}.issubset(set(d["by_type"].keys()))

    def test_media_list_file_type_filter(self, admin_session):
        r = admin_session.get(f"{API}/media/list?file_type=images")
        assert r.status_code == 200
        d = r.json()
        assert "files" in d and "total" in d
        for f in d["files"]:
            assert f["extension"] in ["png", "jpg", "jpeg", "webp", "gif", "svg"]

    def test_media_upload_then_update_tags(self, admin_session):
        # Upload a small file
        s = requests.Session()
        s.cookies = admin_session.cookies
        files = {"file": ("TEST_iter13.png", io.BytesIO(b"\x89PNG\r\n"), "image/png")}
        r = s.post(f"{API}/media/upload", files=files, data={"folder": "test_iter13"})
        assert r.status_code == 200, r.text
        fid = r.json()["id"]
        try:
            # Update tags
            r2 = admin_session.put(f"{API}/media/{fid}/tags", json={"tags": ["tagA", "tagB"]})
            assert r2.status_code == 200
            # Verify via list w/ q
            r3 = admin_session.get(f"{API}/media/list?q=tagA")
            assert r3.status_code == 200
            names = [f["id"] for f in r3.json()["files"]]
            assert fid in names
        finally:
            admin_session.delete(f"{API}/media/{fid}")
