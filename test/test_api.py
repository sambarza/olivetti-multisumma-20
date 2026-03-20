"""Tests for the calculator API endpoints with Google authentication."""

import sys
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app

client = TestClient(app)

# Fake user info returned by the mocked Google token verifier
FAKE_USER = {"sub": "12345", "email": "user@gmail.com"}

AUTH_HEADER = {"Authorization": "Bearer fake-valid-token"}


def _mock_verify(*args, **kwargs):
    """Mock for google.oauth2.id_token.verify_oauth2_token."""
    return FAKE_USER


# --- Authentication tests ---


def test_no_auth_returns_401():
    """Request without token should be rejected."""
    response = client.get("/add/1/2")
    assert response.status_code == 401


def test_invalid_token_returns_401():
    """Request with an invalid token should be rejected."""
    response = client.get("/add/1/2", headers={"Authorization": "Bearer bad-token"})
    assert response.status_code == 401


# --- Add ---


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_add_positive(mock):
    response = client.get("/add/3/5", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json() == {"a": 3.0, "b": 5.0, "operation": "add", "result": 8.0}


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_add_negative(mock):
    response = client.get("/add/-3/5", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 2.0


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_add_floats(mock):
    response = client.get("/add/1.5/2.3", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 3.8


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_add_zero(mock):
    response = client.get("/add/0/0", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 0.0


# --- Subtract ---


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_subtract_positive(mock):
    response = client.get("/subtract/10/4", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json() == {"a": 10.0, "b": 4.0, "operation": "subtract", "result": 6.0}


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_subtract_negative_result(mock):
    response = client.get("/subtract/3/10", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == -7.0


# --- Multiply ---


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_multiply_positive(mock):
    response = client.get("/multiply/3/7", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json() == {"a": 3.0, "b": 7.0, "operation": "multiply", "result": 21.0}


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_multiply_by_zero(mock):
    response = client.get("/multiply/5/0", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 0.0


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_multiply_negatives(mock):
    response = client.get("/multiply/-3/-4", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 12.0


# --- Divide ---


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_divide_positive(mock):
    response = client.get("/divide/10/4", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json() == {"a": 10.0, "b": 4.0, "operation": "divide", "result": 2.5}


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_divide_by_zero_returns_400(mock):
    response = client.get("/divide/5/0", headers=AUTH_HEADER)
    assert response.status_code == 400
    assert response.json()["detail"] == "Division by zero"


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_divide_zero_by_number(mock):
    response = client.get("/divide/0/5", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 0.0


# --- Edge cases (invalid inputs) ---


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_string_input_returns_422(mock):
    response = client.get("/add/abc/5", headers=AUTH_HEADER)
    assert response.status_code == 422


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_missing_second_param_returns_404(mock):
    response = client.get("/add/5/", headers=AUTH_HEADER)
    assert response.status_code in (404, 307)


@patch("main.id_token.verify_oauth2_token", side_effect=_mock_verify)
def test_large_numbers(mock):
    response = client.get("/add/999999999999/1", headers=AUTH_HEADER)
    assert response.status_code == 200
    assert response.json()["result"] == 1000000000000.0
