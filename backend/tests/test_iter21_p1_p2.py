"""Iteration 21: P1 redirects prerequisite (subject has chapters) + P2 curriculum data."""
import os
import requests
import pytest

BASE = os.environ.get('REACT_APP_BACKEND_URL', 'https://igcse-elite.preview.emergentagent.com').rstrip('/')

EXPECTED_SUBJECTS = {"chemistry","physics","biology","mathematics","combined-science","co-ordinated-sciences"}

def test_igcse_returns_six_subjects():
    r = requests.get(f"{BASE}/api/curriculum/boards/igcse", timeout=15)
    assert r.status_code == 200
    data = r.json()
    slugs = {s.get('slug') for s in data.get('subjects', [])}
    assert EXPECTED_SUBJECTS.issubset(slugs), f"Missing subjects: {EXPECTED_SUBJECTS - slugs}"

@pytest.mark.parametrize("subject", sorted(EXPECTED_SUBJECTS))
def test_subject_has_chapters_for_redirect(subject):
    r = requests.get(f"{BASE}/api/curriculum/boards/igcse/{subject}", timeout=15)
    assert r.status_code == 200, f"{subject}: {r.status_code}"
    data = r.json()
    chapters = data.get('chapters') or []
    assert len(chapters) > 0, f"{subject} has no chapters — redirect will fail"
    assert chapters[0].get('slug'), f"{subject} first chapter missing slug"

def test_combined_science_chapter_count():
    r = requests.get(f"{BASE}/api/curriculum/boards/igcse/combined-science", timeout=15)
    assert r.status_code == 200
    assert len(r.json().get('chapters', [])) >= 10

def test_coordinated_sciences_chapter_count():
    r = requests.get(f"{BASE}/api/curriculum/boards/igcse/co-ordinated-sciences", timeout=15)
    assert r.status_code == 200
    assert len(r.json().get('chapters', [])) >= 10
