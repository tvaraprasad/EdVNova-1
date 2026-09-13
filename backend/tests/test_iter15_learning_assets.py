"""
Iteration 15 — Universal Learning Assets API tests.
Endpoints under /api/learning-assets/*.
"""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://igcse-elite.preview.emergentagent.com"
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD

# Deterministic test parent id/type so we can cleanup by query
TEST_PARENT_TYPE = "topic"
TEST_PARENT_ID = f"TEST_iter15_{uuid.uuid4().hex[:8]}"
TEST_SECTION = "introduction"

created_ids = []


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
               timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    yield s
    # cleanup: delete every asset we created for this test parent
    for aid in created_ids:
        try:
            s.delete(f"{BASE_URL}/api/learning-assets/{aid}", timeout=10)
        except Exception:
            pass


@pytest.fixture(scope="module")
def anon_session():
    return requests.Session()


# ---------- tests ----------
# --- upload file asset ---
def test_upload_file_asset(admin_session):
    data = {
        "parent_type": TEST_PARENT_TYPE,
        "parent_id": TEST_PARENT_ID,
        "section": TEST_SECTION,
        "asset_type": "pdf",
        "title": "TEST_iter15 upload",
        "description": "iteration 15 test",
        "access_level": "public",
    }
    files = {"file": ("TEST_iter15.txt", io.BytesIO(b"hello iter15"), "text/plain")}
    r = admin_session.post(f"{BASE_URL}/api/learning-assets/upload", data=data, files=files, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "id" in body and body.get("file_url", "").startswith("/api/uploads/assets/")
    created_ids.append(body["id"])


# --- upload inline image ---
def test_upload_inline_image(admin_session):
    # 1x1 png
    png = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082"
    )
    files = {"file": ("TEST_iter15_pixel.png", io.BytesIO(png), "image/png")}
    r = admin_session.post(f"{BASE_URL}/api/learning-assets/upload-image", files=files, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "url" in body
    assert body["url"].startswith("/api/uploads/assets/images/")

    # verify actually served
    served = requests.get(f"{BASE_URL}{body['url']}", timeout=15)
    assert served.status_code == 200
    assert served.headers.get("content-type", "").startswith("image")


# --- upload-image requires auth ---
def test_upload_inline_image_requires_admin(anon_session):
    files = {"file": ("x.png", io.BytesIO(b"data"), "image/png")}
    r = anon_session.post(f"{BASE_URL}/api/learning-assets/upload-image", files=files, timeout=15)
    assert r.status_code in (401, 403), r.text


# --- create embed asset ---
def test_create_embed_asset(admin_session):
    body = {
        "parent_type": TEST_PARENT_TYPE,
        "parent_id": TEST_PARENT_ID,
        "section": TEST_SECTION,
        "asset_type": "youtube",
        "title": "TEST_iter15 embed",
        "embed_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "access_level": "public",
    }
    r = admin_session.post(f"{BASE_URL}/api/learning-assets/embed", json=body, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    assert "id" in j
    created_ids.append(j["id"])


def test_create_embed_missing_parent(admin_session):
    r = admin_session.post(f"{BASE_URL}/api/learning-assets/embed",
                           json={"section": "x"}, timeout=15)
    assert r.status_code == 400


# --- list assets ---
def test_list_assets(admin_session):
    r = admin_session.get(
        f"{BASE_URL}/api/learning-assets/list",
        params={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID},
        timeout=15,
    )
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    # should include the two we just created (upload + embed)
    assert len(items) >= 2
    for it in items:
        assert "id" in it and "_id" not in it
        assert it["parent_type"] == TEST_PARENT_TYPE
        assert it["parent_id"] == TEST_PARENT_ID


def test_list_assets_filter_section(admin_session):
    r = admin_session.get(
        f"{BASE_URL}/api/learning-assets/list",
        params={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID, "section": TEST_SECTION},
        timeout=15,
    )
    assert r.status_code == 200
    for it in r.json():
        assert it["section"] == TEST_SECTION


# --- visible endpoint excludes draft/private ---
def test_visible_excludes_draft(admin_session, anon_session):
    # create a draft one
    body = {
        "parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID,
        "section": TEST_SECTION, "asset_type": "link",
        "title": "TEST_iter15 draft", "embed_url": "https://example.com/draft",
        "access_level": "draft",
    }
    r = admin_session.post(f"{BASE_URL}/api/learning-assets/embed", json=body, timeout=15)
    assert r.status_code == 200
    draft_id = r.json()["id"]
    created_ids.append(draft_id)

    # visible endpoint (public)
    r2 = anon_session.get(
        f"{BASE_URL}/api/learning-assets/visible",
        params={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID},
        timeout=15,
    )
    assert r2.status_code == 200
    ids = [a["id"] for a in r2.json()]
    assert draft_id not in ids, "draft asset should NOT appear in /visible"

    # list (admin) still shows it
    r3 = admin_session.get(
        f"{BASE_URL}/api/learning-assets/list",
        params={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID},
        timeout=15,
    )
    ids_admin = [a["id"] for a in r3.json()]
    assert draft_id in ids_admin


# --- update ---
def test_update_asset(admin_session):
    assert created_ids, "need created asset"
    aid = created_ids[0]
    r = admin_session.put(
        f"{BASE_URL}/api/learning-assets/{aid}",
        json={"title": "TEST_iter15 updated", "description": "updated desc"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    # verify persisted via list
    r2 = admin_session.get(
        f"{BASE_URL}/api/learning-assets/list",
        params={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID},
        timeout=15,
    )
    updated = next((x for x in r2.json() if x["id"] == aid), None)
    assert updated and updated["title"] == "TEST_iter15 updated"


def test_update_invalid_id(admin_session):
    r = admin_session.put(f"{BASE_URL}/api/learning-assets/not-a-valid-id",
                          json={"title": "x"}, timeout=15)
    assert r.status_code == 400


# --- topic endpoint returns all visible ---
def test_topic_endpoint_returns_visible(anon_session, admin_session):
    r = anon_session.get(f"{BASE_URL}/api/learning-assets/topic/{TEST_PARENT_ID}", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    # no drafts
    for it in items:
        assert it["access_level"] not in ("draft", "scheduled", "private")


# --- delete ---
def test_delete_asset(admin_session):
    # create a throwaway then delete
    r = admin_session.post(f"{BASE_URL}/api/learning-assets/embed",
                           json={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID,
                                 "section": TEST_SECTION, "asset_type": "link",
                                 "title": "TEST_iter15 del", "embed_url": "https://example.com/del",
                                 "access_level": "public"},
                           timeout=15)
    assert r.status_code == 200
    aid = r.json()["id"]
    d = admin_session.delete(f"{BASE_URL}/api/learning-assets/{aid}", timeout=15)
    assert d.status_code == 200
    # verify gone
    r2 = admin_session.get(f"{BASE_URL}/api/learning-assets/list",
                           params={"parent_type": TEST_PARENT_TYPE, "parent_id": TEST_PARENT_ID},
                           timeout=15)
    ids = [x["id"] for x in r2.json()]
    assert aid not in ids


# --- auth required for admin-only endpoints ---
def test_upload_requires_admin(anon_session):
    files = {"file": ("x.txt", io.BytesIO(b"x"), "text/plain")}
    data = {"parent_type": "topic", "parent_id": "anonymous", "section": "x"}
    r = anon_session.post(f"{BASE_URL}/api/learning-assets/upload", data=data, files=files, timeout=15)
    assert r.status_code in (401, 403)


def test_embed_requires_admin(anon_session):
    r = anon_session.post(f"{BASE_URL}/api/learning-assets/embed",
                          json={"parent_type": "topic", "parent_id": "x"}, timeout=15)
    assert r.status_code in (401, 403)


# --- Existing app smoke — verify no regression ---
def test_learn_chapter_page_still_works(anon_session):
    """Backend endpoints backing /learn/igcse/physics/electricity"""
    r = anon_session.get(f"{BASE_URL}/api/curriculum/boards", timeout=15)
    assert r.status_code == 200


def test_membership_tiers_still_returns(anon_session):
    r = anon_session.get(f"{BASE_URL}/api/membership/tiers", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_cms_home_still_returns(anon_session):
    r = anon_session.get(f"{BASE_URL}/api/cms/page/home", timeout=15)
    assert r.status_code == 200
