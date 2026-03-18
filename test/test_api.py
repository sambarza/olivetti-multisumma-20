"""Tests for the double API endpoint."""

from fastapi.testclient import TestClient

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app

client = TestClient(app)


# --- Valid inputs ---


def test_positive_number():
    response = client.get("/double/5")
    assert response.status_code == 200
    assert response.json() == {"number": 5, "result": 10}


def test_negative_number():
    response = client.get("/double/-3")
    assert response.status_code == 200
    assert response.json() == {"number": -3, "result": -6}


def test_zero():
    response = client.get("/double/0")
    assert response.status_code == 200
    assert response.json() == {"number": 0, "result": 0}


def test_large_number():
    response = client.get("/double/999999999")
    assert response.status_code == 200
    assert response.json() == {"number": 999999999, "result": 1999999998}


def test_very_large_number():
    response = client.get("/double/9999999999999999999")
    assert response.status_code == 200
    assert response.json() == {"number": 9999999999999999999, "result": 19999999999999999998}


# --- Edge cases (invalid inputs) ---


def test_string_input_returns_422():
    response = client.get("/double/abc")
    assert response.status_code == 422


def test_float_input_returns_422():
    response = client.get("/double/3.14")
    assert response.status_code == 422


def test_empty_parameter_returns_404():
    response = client.get("/double/")
    assert response.status_code in (404, 307)


def test_special_characters_returns_422():
    response = client.get("/double/@!#")
    assert response.status_code == 422
