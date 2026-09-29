import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["HEALTHY", "DEGRADED"]
    assert "components" in data

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text

def test_schemes_list_endpoint():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 5

def test_demo_login():
    response = client.post("/api/auth/demo-login/CITIZEN")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CITIZEN"

def test_search_endpoint():
    response = client.post("/api/search", json={"query": "scholarships for diploma students", "language": "en"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0
