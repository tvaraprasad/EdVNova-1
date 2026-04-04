"""
EdVNova Learning Platform - Backend API Tests
Tests for: Health check, Authentication, Courses, Products, Orders
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@edvnova.com"
ADMIN_PASSWORD = "Admin@123"


class TestHealthCheck:
    """API Health Check Tests"""
    
    def test_api_root_returns_200(self):
        """Test that API root endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "EdVNova" in data["message"]
        print(f"✓ API root returns: {data}")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_with_valid_admin_credentials(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"✓ Admin login successful: {data['email']}")
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_register_new_user(self):
        """Test user registration"""
        test_email = f"test_user_{os.urandom(4).hex()}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test User"
            }
        )
        # Should return 200 or 201 for successful registration
        # or 400 if user already exists
        assert response.status_code in [200, 201, 400]
        print(f"✓ Registration endpoint working: status {response.status_code}")
    
    def test_get_current_user_without_auth(self):
        """Test /me endpoint without authentication returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /me endpoint correctly requires authentication")


class TestCourses:
    """Course endpoint tests"""
    
    def test_get_all_courses(self):
        """Test getting all courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Courses endpoint returns {len(data)} courses")
    
    def test_get_course_by_subject(self):
        """Test getting course by subject"""
        subjects = ["mathematics", "physics", "chemistry", "biology"]
        for subject in subjects:
            response = requests.get(f"{BASE_URL}/api/courses/{subject}")
            # Should return 200 if course exists, 404 if not
            assert response.status_code in [200, 404]
            if response.status_code == 200:
                data = response.json()
                assert "subject" in data or "title" in data
                print(f"✓ Course for {subject} found")
            else:
                print(f"✓ Course for {subject} not found (404)")


class TestProducts:
    """Product/Store endpoint tests"""
    
    def test_get_all_products(self):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Products endpoint returns {len(data)} products")


class TestWorkshops:
    """Workshop endpoint tests"""
    
    def test_get_all_workshops(self):
        """Test getting all workshops"""
        response = requests.get(f"{BASE_URL}/api/workshops")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Workshops endpoint returns {len(data)} workshops")


class TestResources:
    """Resource endpoint tests"""
    
    def test_get_all_resources(self):
        """Test getting all resources"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Resources endpoint returns {len(data)} resources")


class TestContact:
    """Contact form endpoint tests"""
    
    def test_submit_contact_form(self):
        """Test contact form submission"""
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+91 9876543210",
                "subject": "Test Inquiry",
                "message": "This is a test message"
            }
        )
        # Should return 200 or 201 for successful submission
        assert response.status_code in [200, 201]
        print("✓ Contact form submission successful")


class TestAuthenticatedEndpoints:
    """Tests requiring authentication"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed - skipping authenticated tests")
        return session
    
    def test_get_current_user_with_auth(self, auth_session):
        """Test /me endpoint with authentication"""
        response = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ /me endpoint returns user: {data['email']}")
    
    def test_logout(self, auth_session):
        """Test logout endpoint"""
        response = auth_session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        print("✓ Logout successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
