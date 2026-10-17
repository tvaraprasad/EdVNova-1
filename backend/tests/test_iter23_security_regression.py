# Iteration 23: P0 security (cookies, RBAC, mock-payment ownership) + regression
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


def _set_cookie_headers(resp):
    return resp.raw.headers.getlist("set-cookie") if hasattr(resp.raw.headers, "getlist") else [resp.headers.get("set-cookie", "")]


def _register(session, prefix="regress"):
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@test.com"
    r = session.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Test@12345", "name": "TEST Regress"})
    assert r.status_code == 200, r.text
    return email, r


@pytest.fixture(scope="module")
def student():
    s = requests.Session()
    email, r = _register(s)
    return {"session": s, "email": email, "reg": r}


@pytest.fixture(scope="module")
def student2():
    s = requests.Session()
    email, r = _register(s, "regress2")
    return {"session": s, "email": email}


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}")
    return s


# --- Auth & cookies ---
class TestAuth:
    def test_register_cookie_flags(self, student):
        cookies = _set_cookie_headers(student["reg"])
        joined = " | ".join(cookies)
        print(joined)
        assert "access_token=" in joined and "refresh_token=" in joined
        for c in cookies:
            lc = c.lower()
            assert "httponly" in lc
            assert "secure" in lc
            assert "samesite=lax" in lc
        assert student["reg"].json()["role"] == "student"

    def test_me(self, student):
        r = student["session"].get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == student["email"]
        assert "password_hash" not in r.json()

    def test_login_and_cookie_flags(self, student):
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": student["email"], "password": "Test@12345"})
        assert r.status_code == 200
        for c in _set_cookie_headers(r):
            lc = c.lower()
            assert "httponly" in lc and "secure" in lc and "samesite=lax" in lc

    def test_login_wrong_password(self, student):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": student["email"], "password": "wrong"})
        assert r.status_code == 401

    def test_refresh(self, student):
        r = student["session"].post(f"{BASE_URL}/api/auth/refresh")
        assert r.status_code == 200
        joined = " | ".join(_set_cookie_headers(r)).lower()
        assert "access_token=" in joined and "secure" in joined and "httponly" in joined

    def test_logout_then_me_401(self):
        s = requests.Session()
        _register(s, "regresslogout")
        r = s.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        assert s.get(f"{BASE_URL}/api/auth/me").status_code == 401

    def test_admin_login(self, admin):
        r = admin.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200 and r.json()["role"] == "admin"


# --- RBAC ---
class TestRBAC:
    @pytest.mark.parametrize("path", ["/api/admin/stats", "/api/admin/users", "/api/admin/orders", "/api/admin/contacts"])
    def test_admin_ok(self, admin, path):
        assert admin.get(f"{BASE_URL}{path}").status_code == 200

    @pytest.mark.parametrize("path", ["/api/admin/stats", "/api/admin/users", "/api/admin/orders", "/api/admin/contacts"])
    def test_student_forbidden(self, student, path):
        assert student["session"].get(f"{BASE_URL}{path}").status_code == 403

    def test_anon_unauthorized(self):
        assert requests.get(f"{BASE_URL}/api/admin/stats").status_code == 401


# --- Orders & mock payment ---
class TestOrders:
    def test_order_and_mock_payment(self, student, student2):
        products = requests.get(f"{BASE_URL}/api/products").json()
        assert products
        pid = products[0]["id"]
        s = student["session"]
        r = s.post(f"{BASE_URL}/api/orders/create", json={"items": [{"product_id": pid, "quantity": 1}],
                                                          "shipping_address": "TEST regress address", "phone": "0000000000"})
        assert r.status_code == 200, r.text
        oid = r.json()["id"]
        assert r.json()["status"] == "pending"
        # other user cannot pay
        r2 = student2["session"].post(f"{BASE_URL}/api/orders/{oid}/mock-payment")
        assert r2.status_code == 404
        # anon cannot pay
        assert requests.post(f"{BASE_URL}/api/orders/{oid}/mock-payment").status_code == 401
        # owner pays
        r3 = s.post(f"{BASE_URL}/api/orders/{oid}/mock-payment")
        assert r3.status_code == 200
        assert r3.json()["mode"] == "test" and r3.json()["status"] == "confirmed"
        mine = s.get(f"{BASE_URL}/api/orders/my-orders").json()
        o = next(x for x in mine if x["id"] == oid)
        assert o["status"] == "confirmed" and o["payment_status"] == "completed_test"

    def test_mock_payment_invalid_id(self, student):
        r = student["session"].post(f"{BASE_URL}/api/orders/not-an-objectid/mock-payment")
        print("invalid id status", r.status_code)
        assert r.status_code in (400, 404, 422)


# --- Regression of public endpoints ---
class TestRegression:
    @pytest.mark.parametrize("path", ["/api/products", "/api/courses", "/api/search?q=quadratic"])
    def test_public(self, path):
        r = requests.get(f"{BASE_URL}{path}")
        assert r.status_code == 200

    def test_cors_evil_origin(self):
        r = requests.options(f"{BASE_URL}/api/auth/me", headers={"Origin": "https://evil.example.com",
                                                                 "Access-Control-Request-Method": "GET"})
        acao = r.headers.get("access-control-allow-origin")
        acac = r.headers.get("access-control-allow-credentials")
        print("CORS evil:", r.status_code, acao, acac)
        assert not (acao == "https://evil.example.com" and acac == "true"), "CORS reflects arbitrary origin with credentials"
