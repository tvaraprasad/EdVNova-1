"""
Iteration 14 — CMS v2.0 architecture upgrade tests.

Coverage:
- Membership API: tiers (6), access-levels (7), my-tier (auth), admin set tier
- CMS API: 9 pages (about, career-guidance, community, contact, global, home,
  learn, profile-building, store), store hero, learn hero, global/seo, global/navigation
- Attachments API: access_level field on embed + upload (upload bug),
  topic attachments returned with access_level
- Resources: /api/resources still works publicly (legacy)
- Admin endpoints require auth
"""
import os
import io
import pytest
import requests

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASSWORD = "Admin@123"

TEST_TOPIC_ID = "TEST_iter14_topic_membership"


# ── Fixtures ──
@pytest.fixture(scope="module")
def sess():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_sess():
    s = requests.Session()
    r = s.post(f"{BASE}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
               timeout=10)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["role"] == "admin"
    return s


# ── Membership tiers ──
class TestMembershipTiers:
    def test_get_tiers_returns_six(self, sess):
        r = sess.get(f"{BASE}/api/membership/tiers", timeout=10)
        assert r.status_code == 200
        tiers = r.json()
        assert isinstance(tiers, list)
        slugs = [t["slug"] for t in tiers]
        assert set(slugs) == {"free", "starter", "premium", "school", "teacher", "lifetime"}
        assert len(tiers) == 6
        # Every tier has the required fields
        for t in tiers:
            assert "slug" in t and "name" in t and "access_level" in t and "order" in t
            assert t["access_level"] in ("public", "registered", "premium", "school")

    def test_get_access_levels_returns_seven(self, sess):
        r = sess.get(f"{BASE}/api/membership/access-levels", timeout=10)
        assert r.status_code == 200
        levels = r.json()
        assert set(levels) == {"public", "registered", "premium", "school",
                               "private", "draft", "scheduled"}
        assert len(levels) == 7

    def test_my_tier_requires_auth(self, sess):
        r = sess.get(f"{BASE}/api/membership/my-tier", timeout=10)
        assert r.status_code == 401

    def test_my_tier_with_admin(self, admin_sess):
        r = admin_sess.get(f"{BASE}/api/membership/my-tier", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "tier" in data and "access_level" in data and "user_id" in data
        assert data["tier"]["slug"] in {"free", "starter", "premium", "school", "teacher", "lifetime"}

    def test_admin_set_tier_requires_admin(self, sess):
        r = sess.put(f"{BASE}/api/membership/admin/user/000000000000000000000000/tier",
                     json={"tier": "premium"}, timeout=10)
        assert r.status_code == 401  # no auth

    def test_admin_set_tier_invalid_id(self, admin_sess):
        r = admin_sess.put(f"{BASE}/api/membership/admin/user/not-an-oid/tier",
                           json={"tier": "premium"}, timeout=10)
        assert r.status_code == 400

    def test_admin_set_tier_invalid_tier(self, admin_sess):
        # Get the admin's own user id from /auth/me
        me = admin_sess.get(f"{BASE}/api/auth/me", timeout=10).json()
        r = admin_sess.put(f"{BASE}/api/membership/admin/user/{me['id']}/tier",
                           json={"tier": "not-a-tier"}, timeout=10)
        assert r.status_code == 400

    def test_admin_set_tier_persists(self, admin_sess):
        me = admin_sess.get(f"{BASE}/api/auth/me", timeout=10).json()
        # Set to premium
        r = admin_sess.put(f"{BASE}/api/membership/admin/user/{me['id']}/tier",
                           json={"tier": "premium"}, timeout=10)
        assert r.status_code == 200
        # Verify via my-tier
        mt = admin_sess.get(f"{BASE}/api/membership/my-tier", timeout=10).json()
        assert mt["tier"]["slug"] == "premium"
        assert mt["access_level"] == "premium"
        # Revert
        admin_sess.put(f"{BASE}/api/membership/admin/user/{me['id']}/tier",
                       json={"tier": "free"}, timeout=10)

    def test_admin_stats_by_tier(self, admin_sess):
        r = admin_sess.get(f"{BASE}/api/membership/admin/stats", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "total_users" in d and "by_tier" in d
        # keys include all tier slugs + unset
        for slug in ("free", "starter", "premium", "school", "teacher", "lifetime", "unset"):
            assert slug in d["by_tier"]


# ── CMS: 9 pages ──
class TestCMSPages:
    EXPECTED_PAGES = {"about", "career-guidance", "community", "contact",
                      "global", "home", "learn", "profile-building", "store"}

    def test_admin_pages_requires_auth(self, sess):
        r = sess.get(f"{BASE}/api/cms/admin/pages", timeout=10)
        assert r.status_code == 401

    def test_admin_pages_returns_nine(self, admin_sess):
        r = admin_sess.get(f"{BASE}/api/cms/admin/pages", timeout=10)
        assert r.status_code == 200
        pages = r.json()
        page_names = {p["page"] for p in pages}
        assert page_names >= self.EXPECTED_PAGES, f"missing pages: {self.EXPECTED_PAGES - page_names}"
        # Sanity: home has 7 sections
        home = next(p for p in pages if p["page"] == "home")
        assert len(home["sections"]) >= 7

    def test_page_store_hero(self, sess):
        r = sess.get(f"{BASE}/api/cms/page/store", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "hero" in d
        assert "heading" in d["hero"]

    def test_page_learn_hero(self, sess):
        r = sess.get(f"{BASE}/api/cms/page/learn", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "hero" in d
        assert "heading" in d["hero"]

    def test_page_community_hero(self, sess):
        r = sess.get(f"{BASE}/api/cms/page/community", timeout=10)
        assert r.status_code == 200
        assert "hero" in r.json()

    def test_page_career_guidance_hero(self, sess):
        r = sess.get(f"{BASE}/api/cms/page/career-guidance", timeout=10)
        assert r.status_code == 200
        assert "hero" in r.json()

    def test_page_profile_building_hero(self, sess):
        r = sess.get(f"{BASE}/api/cms/page/profile-building", timeout=10)
        assert r.status_code == 200
        assert "hero" in r.json()

    def test_global_seo(self, sess):
        r = sess.get(f"{BASE}/api/cms/section/global/seo", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "site_title" in d and "site_description" in d

    def test_global_navigation(self, sess):
        r = sess.get(f"{BASE}/api/cms/section/global/navigation", timeout=10)
        assert r.status_code == 200
        d = r.json()
        # Should have nav labels
        assert any(k in d for k in ("learn_label", "store_label", "cta_text"))

    def test_home_still_has_seven_sections(self, sess):
        r = sess.get(f"{BASE}/api/cms/page/home", timeout=10)
        assert r.status_code == 200
        d = r.json()
        for s in ("hero", "trust_strip", "choose_path", "boards",
                  "why_different", "testimonials", "final_cta"):
            assert s in d, f"home missing section {s}"


# ── Attachments access_level ──
class TestAttachmentsAccessLevel:
    """Verify access_level field is accepted on both /upload and /embed."""

    @classmethod
    def teardown_class(cls):
        # Clean all attachments on TEST topic id
        s = requests.Session()
        r = s.post(f"{BASE}/api/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        if r.status_code == 200:
            atts = s.get(f"{BASE}/api/attachments/topic/{TEST_TOPIC_ID}", timeout=10).json()
            for a in atts:
                s.delete(f"{BASE}/api/attachments/{a['id']}", timeout=10)

    def test_embed_persists_access_level(self, admin_sess):
        r = admin_sess.post(f"{BASE}/api/attachments/embed",
                            json={"topic_id": TEST_TOPIC_ID,
                                  "title": "TEST_iter14_embed",
                                  "embed_url": "https://www.youtube.com/embed/xyz",
                                  "attachment_type": "youtube",
                                  "access_level": "premium",
                                  "is_visible": True},
                            timeout=10)
        assert r.status_code == 200
        aid = r.json()["id"]
        # Verify via list
        atts = admin_sess.get(f"{BASE}/api/attachments/topic/{TEST_TOPIC_ID}", timeout=10).json()
        att = next(a for a in atts if a["id"] == aid)
        assert att["access_level"] == "premium"

    def test_upload_persists_access_level(self, admin_sess):
        files = {"file": ("TEST_iter14.txt", io.BytesIO(b"iter14 upload"), "text/plain")}
        data = {
            "topic_id": TEST_TOPIC_ID,
            "attachment_type": "document",
            "title": "TEST_iter14_upload",
            "description": "iter14 upload test",
            "is_visible": "true",
            "access_level": "premium",
        }
        r = admin_sess.post(f"{BASE}/api/attachments/upload", files=files, data=data, timeout=15)
        assert r.status_code == 200
        aid = r.json()["id"]
        atts = admin_sess.get(f"{BASE}/api/attachments/topic/{TEST_TOPIC_ID}", timeout=10).json()
        att = next(a for a in atts if a["id"] == aid)
        # BUG: attachments_api.py line 47 hardcodes access_level to "public",
        # ignoring the Form param. This assertion documents the expected behavior.
        assert att["access_level"] == "premium", \
            f"UPLOAD access_level bug: expected 'premium', got '{att['access_level']}'. " \
            f"Fix: attachments_api.py:47 change '\"access_level\": \"public\"' to '\"access_level\": access_level'."

    def test_put_update_access_level(self, admin_sess):
        # Create fresh, then PUT to update access_level, verify
        r = admin_sess.post(f"{BASE}/api/attachments/embed",
                            json={"topic_id": TEST_TOPIC_ID,
                                  "title": "TEST_iter14_put",
                                  "embed_url": "https://www.youtube.com/embed/qwe",
                                  "attachment_type": "youtube",
                                  "access_level": "public",
                                  "is_visible": True},
                            timeout=10).json()
        aid = r["id"]
        upd = admin_sess.put(f"{BASE}/api/attachments/{aid}",
                             json={"access_level": "school"}, timeout=10)
        assert upd.status_code == 200
        atts = admin_sess.get(f"{BASE}/api/attachments/topic/{TEST_TOPIC_ID}", timeout=10).json()
        att = next(a for a in atts if a["id"] == aid)
        assert att["access_level"] == "school"


# ── /learn hierarchy still works ──
class TestLearnRoutes:
    def test_boards_list(self, sess):
        r = sess.get(f"{BASE}/api/curriculum/boards", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_board_detail(self, sess):
        r = sess.get(f"{BASE}/api/curriculum/boards/igcse", timeout=10)
        assert r.status_code == 200

    def test_chapter_detail(self, sess):
        r = sess.get(f"{BASE}/api/curriculum/boards/igcse/physics/electricity", timeout=10)
        assert r.status_code == 200


# ── Legacy resources endpoint still exists ──
class TestLegacyResources:
    def test_api_resources_ok(self, sess):
        r = sess.get(f"{BASE}/api/resources", timeout=10)
        # Endpoint may return anything as long as it is 200 (public list)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
