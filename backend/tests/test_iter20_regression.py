"""Iter 20: Regression tests after code-quality refactor (no functional changes expected)."""
import os
import pytest
import requests
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


def test_admin_login_returns_200():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    d = r.json()
    assert d.get("email") == ADMIN_EMAIL and d.get("role") == "admin"


def test_curriculum_boards():
    r = requests.get(f"{API}/curriculum/boards")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1


def test_past_papers_browse():
    r = requests.get(f"{API}/past-papers/browse")
    assert r.status_code == 200
    data = r.json()
    # Should have some structure — list or dict with papers key
    assert isinstance(data, (list, dict))


def test_search_quadratic():
    r = requests.get(f"{API}/search", params={"q": "quadratic"})
    assert r.status_code == 200
    d = r.json()
    assert "results" in d


def test_media_folders_requires_admin():
    # Unauth call should be rejected
    r = requests.get(f"{API}/media/folders")
    assert r.status_code in (401, 403)


def test_media_folders_admin_ok(admin_session):
    r = admin_session.get(f"{API}/media/folders")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # Refactored code should still return name+count structure
    for f in data:
        assert "name" in f and "count" in f
