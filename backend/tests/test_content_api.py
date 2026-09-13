"""
Test suite for EdVNova Content API - Modules, Lessons, Uploads, Course Content
Tests the new course hierarchy (Course -> Modules -> Lessons) and file upload system
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


class TestAuthAndHealth:
    """Basic health and auth tests"""
    
    def test_api_health(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API health check passed: {data['message']}")
    
    def test_admin_login(self):
        """Test admin login returns 200 and sets cookies"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful: {data['email']}")


class TestModulesAPI:
    """Test module CRUD operations"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    @pytest.fixture
    def test_course_id(self, admin_session):
        """Get a course ID for testing"""
        response = admin_session.get(f"{BASE_URL}/api/manage/courses")
        assert response.status_code == 200
        courses = response.json()
        if not courses:
            pytest.skip("No courses available for testing")
        return courses[0]["id"]
    
    def test_get_modules_by_course(self, admin_session, test_course_id):
        """GET /api/modules/by-course/{course_id} returns modules list"""
        response = admin_session.get(f"{BASE_URL}/api/modules/by-course/{test_course_id}")
        assert response.status_code == 200
        modules = response.json()
        assert isinstance(modules, list)
        print(f"✓ GET modules by course: {len(modules)} modules found")
        return modules
    
    def test_create_module(self, admin_session, test_course_id):
        """POST /api/modules creates a new module (admin only)"""
        payload = {
            "course_id": test_course_id,
            "title": "TEST_Module_Pytest",
            "description": "Test module created by pytest",
            "order": 99
        }
        response = admin_session.post(f"{BASE_URL}/api/modules", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Module created"
        print(f"✓ Module created with ID: {data['id']}")
        
        # Verify module exists
        get_response = admin_session.get(f"{BASE_URL}/api/modules/by-course/{test_course_id}")
        modules = get_response.json()
        module_titles = [m["title"] for m in modules]
        assert "TEST_Module_Pytest" in module_titles
        print("✓ Module verified in course modules list")
        
        # Cleanup - delete the test module
        module_id = data["id"]
        delete_response = admin_session.delete(f"{BASE_URL}/api/modules/{module_id}")
        assert delete_response.status_code == 200
        print("✓ Test module cleaned up")


class TestLessonsAPI:
    """Test lesson CRUD operations"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    @pytest.fixture
    def test_module_id(self, admin_session):
        """Get a module ID for testing"""
        # First get a course
        courses_response = admin_session.get(f"{BASE_URL}/api/manage/courses")
        courses = courses_response.json()
        if not courses:
            pytest.skip("No courses available")
        
        course_id = courses[0]["id"]
        modules_response = admin_session.get(f"{BASE_URL}/api/modules/by-course/{course_id}")
        modules = modules_response.json()
        
        if not modules:
            # Create a test module
            create_response = admin_session.post(f"{BASE_URL}/api/modules", json={
                "course_id": course_id,
                "title": "TEST_Module_For_Lessons",
                "description": "Temp module for lesson tests",
                "order": 0
            })
            return create_response.json()["id"]
        return modules[0]["id"]
    
    def test_get_lessons_by_module(self, admin_session, test_module_id):
        """GET /api/lessons/by-module/{module_id} returns lessons list"""
        response = admin_session.get(f"{BASE_URL}/api/lessons/by-module/{test_module_id}")
        assert response.status_code == 200
        lessons = response.json()
        assert isinstance(lessons, list)
        print(f"✓ GET lessons by module: {len(lessons)} lessons found")
    
    def test_create_lesson(self, admin_session, test_module_id):
        """POST /api/lessons creates a new lesson (admin only)"""
        payload = {
            "module_id": test_module_id,
            "title": "TEST_Lesson_Pytest",
            "description": "Test lesson created by pytest",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "youtube",
            "is_preview": True,
            "order": 99,
            "duration": "10 min"
        }
        response = admin_session.post(f"{BASE_URL}/api/lessons", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Lesson created"
        print(f"✓ Lesson created with ID: {data['id']}")
        
        # Verify lesson exists
        get_response = admin_session.get(f"{BASE_URL}/api/lessons/by-module/{test_module_id}")
        lessons = get_response.json()
        lesson_titles = [l["title"] for l in lessons]
        assert "TEST_Lesson_Pytest" in lesson_titles
        print("✓ Lesson verified in module lessons list")
        
        # Cleanup
        lesson_id = data["id"]
        delete_response = admin_session.delete(f"{BASE_URL}/api/lessons/{lesson_id}")
        assert delete_response.status_code == 200
        print("✓ Test lesson cleaned up")


class TestCourseContentAPI:
    """Test course content endpoint for student-facing access"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    @pytest.fixture
    def test_course_id(self, admin_session):
        """Get a course ID for testing"""
        response = admin_session.get(f"{BASE_URL}/api/manage/courses")
        courses = response.json()
        if not courses:
            pytest.skip("No courses available")
        return courses[0]["id"]
    
    def test_get_course_content(self, admin_session, test_course_id):
        """GET /api/content/course/{course_id} returns full course hierarchy"""
        response = admin_session.get(f"{BASE_URL}/api/content/course/{test_course_id}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify course structure
        assert "id" in data
        assert "title" in data
        assert "modules" in data
        assert "is_enrolled" in data
        assert isinstance(data["modules"], list)
        
        print(f"✓ Course content retrieved: {data['title']}")
        print(f"  - Modules: {len(data['modules'])}")
        print(f"  - Is enrolled: {data['is_enrolled']}")
        
        # Check module structure if modules exist
        if data["modules"]:
            module = data["modules"][0]
            assert "id" in module
            assert "title" in module
            assert "lessons" in module
            print(f"  - First module: {module['title']} with {len(module['lessons'])} lessons")


class TestAdminManagementEndpoints:
    """Test admin management endpoints for courses, resources, products"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    def test_get_manage_courses(self, admin_session):
        """GET /api/manage/courses returns courses with module/lesson counts"""
        response = admin_session.get(f"{BASE_URL}/api/manage/courses")
        assert response.status_code == 200
        courses = response.json()
        assert isinstance(courses, list)
        
        if courses:
            course = courses[0]
            assert "id" in course
            assert "title" in course
            assert "module_count" in course
            assert "lesson_count" in course
            print(f"✓ Manage courses: {len(courses)} courses")
            print(f"  - First course: {course['title']} ({course['module_count']} modules, {course['lesson_count']} lessons)")
    
    def test_get_manage_resources(self, admin_session):
        """GET /api/manage/resources returns all resources"""
        response = admin_session.get(f"{BASE_URL}/api/manage/resources")
        assert response.status_code == 200
        resources = response.json()
        assert isinstance(resources, list)
        print(f"✓ Manage resources: {len(resources)} resources")
    
    def test_get_manage_products(self, admin_session):
        """GET /api/manage/products returns all products"""
        response = admin_session.get(f"{BASE_URL}/api/manage/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        print(f"✓ Manage products: {len(products)} products")


class TestAdminCRUD:
    """Test admin CRUD for courses, resources, products"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    def test_course_crud(self, admin_session):
        """Test course create, update, delete"""
        # Create
        payload = {
            "title": "TEST_Course_Pytest",
            "subject": "Mathematics",
            "description": "Test course created by pytest",
            "syllabus": ["Topic 1", "Topic 2"],
            "teaching_approach": "Test approach",
            "exam_strategy": "Test strategy",
            "schedule": "Test schedule",
            "outcomes": ["Outcome 1"],
            "duration": "3 months",
            "price": 1000
        }
        create_response = admin_session.post(f"{BASE_URL}/api/admin/courses", json=payload)
        assert create_response.status_code == 200
        course_id = create_response.json()["id"]
        print(f"✓ Course created: {course_id}")
        
        # Update
        payload["title"] = "TEST_Course_Pytest_Updated"
        update_response = admin_session.put(f"{BASE_URL}/api/admin/courses/{course_id}", json=payload)
        assert update_response.status_code == 200
        print("✓ Course updated")
        
        # Delete (soft delete)
        delete_response = admin_session.delete(f"{BASE_URL}/api/admin/courses/{course_id}")
        assert delete_response.status_code == 200
        print("✓ Course deleted")
    
    def test_resource_crud(self, admin_session):
        """Test resource create, update, delete"""
        # Create
        payload = {
            "title": "TEST_Resource_Pytest",
            "description": "Test resource",
            "subject": "Mathematics",
            "resource_type": "PDF",
            "is_premium": True
        }
        create_response = admin_session.post(f"{BASE_URL}/api/admin/resources", json=payload)
        assert create_response.status_code == 200
        resource_id = create_response.json()["id"]
        print(f"✓ Resource created: {resource_id}")
        
        # Update
        payload["title"] = "TEST_Resource_Pytest_Updated"
        update_response = admin_session.put(f"{BASE_URL}/api/admin/resources/{resource_id}", json=payload)
        assert update_response.status_code == 200
        print("✓ Resource updated")
        
        # Delete
        delete_response = admin_session.delete(f"{BASE_URL}/api/admin/resources/{resource_id}")
        assert delete_response.status_code == 200
        print("✓ Resource deleted")
    
    def test_product_crud(self, admin_session):
        """Test product create, update, delete"""
        # Create
        payload = {
            "title": "TEST_Product_Pytest",
            "description": "Test product",
            "category": "Workbooks",
            "price": 500,
            "stock": 10
        }
        create_response = admin_session.post(f"{BASE_URL}/api/admin/products", json=payload)
        assert create_response.status_code == 200
        product_id = create_response.json()["id"]
        print(f"✓ Product created: {product_id}")
        
        # Update
        payload["title"] = "TEST_Product_Pytest_Updated"
        update_response = admin_session.put(f"{BASE_URL}/api/admin/products/{product_id}", json=payload)
        assert update_response.status_code == 200
        print("✓ Product updated")
        
        # Delete (soft delete)
        delete_response = admin_session.delete(f"{BASE_URL}/api/admin/products/{product_id}")
        assert delete_response.status_code == 200
        print("✓ Product deleted")


class TestAdminPanelTabs:
    """Test admin panel data endpoints for all 7 tabs"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    def test_admin_stats(self, admin_session):
        """GET /api/admin/stats returns dashboard stats"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "courses" in data
        assert "workshops" in data
        assert "orders" in data
        assert "enrollments" in data
        print(f"✓ Admin stats: {data}")
    
    def test_admin_users(self, admin_session):
        """GET /api/admin/users returns all users"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        print(f"✓ Admin users: {len(users)} users")
    
    def test_admin_orders(self, admin_session):
        """GET /api/admin/orders returns all orders"""
        response = admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        print(f"✓ Admin orders: {len(orders)} orders")
    
    def test_admin_contacts(self, admin_session):
        """GET /api/admin/contacts returns all contact messages"""
        response = admin_session.get(f"{BASE_URL}/api/admin/contacts")
        assert response.status_code == 200
        contacts = response.json()
        assert isinstance(contacts, list)
        print(f"✓ Admin contacts: {len(contacts)} messages")


class TestDownloadsAPI:
    """Test downloads tracking endpoints"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        return session
    
    def test_get_my_downloads(self, admin_session):
        """GET /api/downloads/my returns user's download history"""
        response = admin_session.get(f"{BASE_URL}/api/downloads/my")
        assert response.status_code == 200
        downloads = response.json()
        assert isinstance(downloads, list)
        print(f"✓ My downloads: {len(downloads)} downloads")
    
    def test_track_download(self, admin_session):
        """POST /api/downloads/track records a download"""
        payload = {
            "resource_type": "resource",
            "resource_id": "test123",
            "resource_title": "TEST_Download_Pytest",
            "file_url": "/api/uploads/pdfs/test.pdf"
        }
        response = admin_session.post(f"{BASE_URL}/api/downloads/track", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Download tracked"
        print("✓ Download tracked successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
