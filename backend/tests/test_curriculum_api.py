"""
Curriculum API Tests for EdVNova Learning Platform
Tests all curriculum endpoints: boards, subjects, chapters, topics, search, and student features
"""
import pytest
import requests
import os
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCurriculumBrowse:
    """Tests for curriculum browsing endpoints"""
    
    def test_list_boards_returns_3_boards(self):
        """GET /api/curriculum/boards returns 3 boards (IGCSE, AS Level, A Level)"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards")
        assert response.status_code == 200
        
        boards = response.json()
        assert len(boards) == 3
        
        # Verify board names
        board_names = [b["name"] for b in boards]
        assert "Cambridge IGCSE" in board_names
        assert "AS Level" in board_names
        assert "A Level" in board_names
        
        # Verify each board has topic counts
        for board in boards:
            assert "topic_count" in board
            assert "subject_count" in board
            assert board["topic_count"] > 0
    
    def test_get_igcse_board_returns_4_subjects(self):
        """GET /api/curriculum/boards/igcse returns board with 4 subjects"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Cambridge IGCSE"
        assert "subjects" in data
        assert len(data["subjects"]) == 4
        
        # Verify subject names
        subject_names = [s["name"] for s in data["subjects"]]
        assert "Chemistry" in subject_names
        assert "Physics" in subject_names
        assert "Biology" in subject_names
        assert "Mathematics" in subject_names
    
    def test_get_chemistry_subject_returns_11_chapters(self):
        """GET /api/curriculum/boards/igcse/chemistry returns 11 chapters"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/chemistry")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Chemistry"
        assert "chapters" in data
        assert len(data["chapters"]) == 11
        
        # Verify each chapter has topic_count
        for chapter in data["chapters"]:
            assert "topic_count" in chapter
            assert "published_count" in chapter
    
    def test_get_atomic_structure_chapter_returns_5_topics(self):
        """GET /api/curriculum/boards/igcse/chemistry/atomic-structure returns 5 topics"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/chemistry/atomic-structure")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Atomic Structure"
        assert "topics" in data
        assert len(data["topics"]) == 5
        
        # Verify topic structure
        for topic in data["topics"]:
            assert "title" in topic
            assert "slug" in topic
            assert "study_time" in topic
            assert "difficulty" in topic
            assert "status" in topic
    
    def test_get_isotopes_topic_has_full_content(self):
        """GET /api/curriculum/boards/igcse/chemistry/atomic-structure/isotopes returns full topic content"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/chemistry/atomic-structure/isotopes")
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "Isotopes"
        assert data["status"] == "published"
        
        # Verify content structure
        content = data["content"]
        assert "introduction" in content
        assert len(content["introduction"]) > 0
        
        assert "definitions" in content
        assert len(content["definitions"]) >= 4
        
        assert "formulas" in content
        assert len(content["formulas"]) >= 2
        
        assert "worked_examples" in content
        assert len(content["worked_examples"]) >= 1
        
        assert "common_mistakes" in content
        assert len(content["common_mistakes"]) >= 3
        
        assert "examiner_tips" in content
        assert len(content["examiner_tips"]) >= 2
        
        assert "summary" in content
        assert len(content["summary"]) >= 3
        
        # Verify prev/next navigation
        assert "prev_topic" in data
        assert "next_topic" in data
        assert "related_topics" in data
    
    def test_get_acceleration_topic_has_suvat_formulas(self):
        """GET /api/curriculum/boards/igcse/physics/motion/acceleration has SUVAT formulas"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/physics/motion/acceleration")
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "Acceleration"
        assert data["status"] == "published"
        
        # Verify SUVAT formulas
        content = data["content"]
        formulas = content.get("formulas", [])
        formula_names = [f["name"] for f in formulas]
        
        assert "Acceleration" in formula_names
        assert any("SUVAT" in name for name in formula_names)
    
    def test_board_not_found_returns_404(self):
        """GET /api/curriculum/boards/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/invalid-board")
        assert response.status_code == 404
    
    def test_subject_not_found_returns_404(self):
        """GET /api/curriculum/boards/igcse/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/invalid-subject")
        assert response.status_code == 404
    
    def test_chapter_not_found_returns_404(self):
        """GET /api/curriculum/boards/igcse/chemistry/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/chemistry/invalid-chapter")
        assert response.status_code == 404
    
    def test_topic_not_found_returns_404(self):
        """GET /api/curriculum/boards/igcse/chemistry/atomic-structure/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/curriculum/boards/igcse/chemistry/atomic-structure/invalid-topic")
        assert response.status_code == 404


class TestCurriculumSearch:
    """Tests for curriculum search endpoint"""
    
    def test_search_isotopes_returns_results(self):
        """GET /api/curriculum/search?q=isotopes returns search results"""
        response = requests.get(f"{BASE_URL}/api/curriculum/search?q=isotopes")
        assert response.status_code == 200
        
        results = response.json()
        assert len(results) >= 1
        
        # Verify isotopes topic is in results
        titles = [r["title"] for r in results]
        assert "Isotopes" in titles
    
    def test_search_with_board_filter(self):
        """GET /api/curriculum/search?q=&board=igcse returns only IGCSE topics"""
        response = requests.get(f"{BASE_URL}/api/curriculum/search?board=igcse&limit=50")
        assert response.status_code == 200
        
        results = response.json()
        assert len(results) > 0
        
        # All results should be from IGCSE
        for result in results:
            assert result["board_slug"] == "igcse"
    
    def test_search_with_subject_filter(self):
        """GET /api/curriculum/search?subject=chemistry returns only chemistry topics"""
        response = requests.get(f"{BASE_URL}/api/curriculum/search?subject=chemistry&limit=50")
        assert response.status_code == 200
        
        results = response.json()
        assert len(results) > 0
        
        # All results should be chemistry
        for result in results:
            assert result["subject_slug"] == "chemistry"
    
    def test_search_empty_query_returns_results(self):
        """GET /api/curriculum/search with no query returns results"""
        response = requests.get(f"{BASE_URL}/api/curriculum/search?limit=10")
        assert response.status_code == 200
        
        results = response.json()
        # Should return some results even without query
        assert isinstance(results, list)


class TestAuth:
    """Tests for authentication endpoints"""
    
    def test_login_with_admin_credentials(self):
        """POST /api/auth/login with admin@edvnova.com / Admin@123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        
        data = response.json()
        # Login returns user data directly (not nested under "user" key)
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"


class TestStudentFeatures:
    """Tests for student bookmark and progress features (requires auth)"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return session
    
    def test_toggle_bookmark(self, auth_session):
        """POST /api/curriculum/user/bookmark toggles bookmark"""
        response = auth_session.post(f"{BASE_URL}/api/curriculum/user/bookmark", json={
            "topic_path": "igcse/chemistry/atomic-structure/isotopes",
            "topic_title": "Isotopes",
            "board_slug": "igcse",
            "subject_slug": "chemistry"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "bookmarked" in data
        assert isinstance(data["bookmarked"], bool)
    
    def test_get_bookmarks(self, auth_session):
        """GET /api/curriculum/user/bookmarks returns user bookmarks"""
        response = auth_session.get(f"{BASE_URL}/api/curriculum/user/bookmarks")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_toggle_progress(self, auth_session):
        """POST /api/curriculum/user/progress toggles progress"""
        response = auth_session.post(f"{BASE_URL}/api/curriculum/user/progress", json={
            "topic_path": "igcse/chemistry/atomic-structure/isotopes",
            "board_slug": "igcse",
            "subject_slug": "chemistry"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "completed" in data
        assert isinstance(data["completed"], bool)
    
    def test_get_progress(self, auth_session):
        """GET /api/curriculum/user/progress returns user progress"""
        response = auth_session.get(f"{BASE_URL}/api/curriculum/user/progress")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_bookmark_requires_auth(self):
        """POST /api/curriculum/user/bookmark without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/curriculum/user/bookmark", json={
            "topic_path": "test/path"
        })
        assert response.status_code == 401
    
    def test_progress_requires_auth(self):
        """POST /api/curriculum/user/progress without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/curriculum/user/progress", json={
            "topic_path": "test/path"
        })
        assert response.status_code == 401


class TestExistingFeatures:
    """Tests to verify existing features still work"""
    
    def test_health_check(self):
        """GET /api/ returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
    
    def test_courses_endpoint(self):
        """GET /api/courses returns 200"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
    
    def test_workshops_endpoint(self):
        """GET /api/workshops returns 200"""
        response = requests.get(f"{BASE_URL}/api/workshops")
        assert response.status_code == 200
    
    def test_resources_endpoint(self):
        """GET /api/resources returns 200"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
    
    def test_products_endpoint(self):
        """GET /api/products returns 200"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
