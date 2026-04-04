import requests
import sys
import json
from datetime import datetime

class EdVNovaAPITester:
    def __init__(self, base_url="https://igcse-elite.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, cookies=cookies)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, cookies=cookies)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(response_data) <= 5:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: {len(response_data)} items returned")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health"""
        return self.run_test("API Health Check", "GET", "api/", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@edvnova.com", "password": "Admin@123"}
        )
        if success and 'id' in response:
            # Store cookies for subsequent requests
            print(f"   Admin logged in: {response.get('name')} ({response.get('role')})")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_user_data
        )
        if success:
            print(f"   User registered: {response.get('name')} ({response.get('email')})")
        return success

    def test_user_login(self):
        """Test user login with a new user"""
        # First register a user
        test_email = f"login_test_{datetime.now().strftime('%H%M%S')}@test.com"
        reg_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Login Test User"
        }
        reg_success, _ = self.run_test(
            "User Registration for Login Test",
            "POST",
            "api/auth/register",
            200,
            data=reg_data
        )
        
        if not reg_success:
            return False
            
        # Then test login
        login_data = {
            "email": test_email,
            "password": "TestPass123!"
        }
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        return success

    def test_courses_api(self):
        """Test courses endpoints"""
        success, courses = self.run_test("Get All Courses", "GET", "api/courses", 200)
        if success and isinstance(courses, list):
            print(f"   Found {len(courses)} courses")
            if len(courses) > 0:
                course_id = courses[0].get('id')
                if course_id:
                    self.run_test(f"Get Course Details", "GET", f"api/courses/{course_id}", 200)
        return success

    def test_workshops_api(self):
        """Test workshops endpoints"""
        success, workshops = self.run_test("Get All Workshops", "GET", "api/workshops", 200)
        if success and isinstance(workshops, list):
            print(f"   Found {len(workshops)} workshops")
            if len(workshops) > 0:
                workshop_id = workshops[0].get('id')
                if workshop_id:
                    self.run_test(f"Get Workshop Details", "GET", f"api/workshops/{workshop_id}", 200)
        return success

    def test_resources_api(self):
        """Test resources endpoints"""
        # Test without authentication (should show limited data)
        success, resources = self.run_test("Get Resources (Unauthenticated)", "GET", "api/resources", 200)
        if success and isinstance(resources, list):
            print(f"   Found {len(resources)} resources (unauthenticated)")
        return success

    def test_products_api(self):
        """Test products endpoints"""
        success, products = self.run_test("Get All Products", "GET", "api/products", 200)
        if success and isinstance(products, list):
            print(f"   Found {len(products)} products")
            if len(products) > 0:
                product_id = products[0].get('id')
                if product_id:
                    self.run_test(f"Get Product Details", "GET", f"api/products/{product_id}", 200)
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test Contact",
            "email": "test@example.com",
            "phone": "+91-9876543210",
            "message": "This is a test contact message",
            "subject": "Test Subject"
        }
        return self.run_test("Contact Form Submission", "POST", "api/contact", 200, data=contact_data)

    def test_admin_endpoints(self):
        """Test admin-only endpoints (requires admin login)"""
        # First login as admin
        admin_login_success = self.test_admin_login()
        if not admin_login_success:
            print("❌ Cannot test admin endpoints - admin login failed")
            return False

        # Test admin stats
        stats_success, _ = self.run_test("Admin Stats", "GET", "api/admin/stats", 200)
        
        # Test admin users list
        users_success, _ = self.run_test("Admin Users List", "GET", "api/admin/users", 200)
        
        # Test admin orders list
        orders_success, _ = self.run_test("Admin Orders List", "GET", "api/admin/orders", 200)
        
        # Test admin contacts list
        contacts_success, _ = self.run_test("Admin Contacts List", "GET", "api/admin/contacts", 200)
        
        return all([stats_success, users_success, orders_success, contacts_success])

    def test_protected_endpoints(self):
        """Test endpoints that require authentication"""
        # Test without authentication (should fail)
        self.run_test("Get User Profile (Unauthenticated)", "GET", "api/auth/me", 401)
        
        # Register and login a user first
        test_email = f"protected_test_{datetime.now().strftime('%H%M%S')}@test.com"
        reg_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Protected Test User"
        }
        reg_success, _ = self.run_test(
            "User Registration for Protected Tests",
            "POST",
            "api/auth/register",
            200,
            data=reg_data
        )
        
        if reg_success:
            # Test authenticated endpoints
            self.run_test("Get User Profile (Authenticated)", "GET", "api/auth/me", 200)
            self.run_test("Get User Enrollments", "GET", "api/courses/user/enrollments", 200)
            self.run_test("Get User Workshop Registrations", "GET", "api/workshops/user/registrations", 200)
            self.run_test("Get User Orders", "GET", "api/orders/my-orders", 200)
        
        return reg_success

def main():
    print("🚀 Starting EdVNova Learning Platform API Tests")
    print("=" * 60)
    
    tester = EdVNovaAPITester()
    
    # Run all tests
    test_results = []
    
    print("\n📋 BASIC API TESTS")
    test_results.append(tester.test_health_check())
    
    print("\n🔐 AUTHENTICATION TESTS")
    test_results.append(tester.test_admin_login())
    test_results.append(tester.test_user_registration())
    test_results.append(tester.test_user_login())
    
    print("\n📚 CONTENT API TESTS")
    test_results.append(tester.test_courses_api())
    test_results.append(tester.test_workshops_api())
    test_results.append(tester.test_resources_api())
    test_results.append(tester.test_products_api())
    
    print("\n📞 CONTACT FORM TESTS")
    test_results.append(tester.test_contact_form())
    
    print("\n🔒 PROTECTED ENDPOINT TESTS")
    test_results.append(tester.test_protected_endpoints())
    
    print("\n👑 ADMIN ENDPOINT TESTS")
    test_results.append(tester.test_admin_endpoints())
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())