"""Shared test configuration — loads credentials from environment or .env"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL", "admin@edvnova.com")
ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD", "Admin@123")
API_BASE = os.getenv("TEST_API_BASE", "http://localhost:8001/api")
