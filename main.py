"""
Calculator REST API with Google authentication.

Provides basic arithmetic operations: add, subtract, multiply, divide.
All endpoints require a valid Google OAuth2 ID token.

Run with: uvicorn main:app --reload
"""

import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Set this to your Google OAuth Client ID to restrict access.
GOOGLE_CLIENT_ID = "408727797747-ujv91ko0jcj91v6n6rb9qkm2t33im60n.apps.googleusercontent.com"


def verify_google_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify the Google ID token and return the user info."""
    try:
        user_info = id_token.verify_oauth2_token(
            credentials.credentials,
            google_requests.Request(),
            audience=GOOGLE_CLIENT_ID,
        )
        return user_info
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


# --- Calculator endpoints ---


@app.get("/add/{a}/{b}")
def add(a: float, b: float, user: dict = Depends(verify_google_token)) -> dict:
    """Return the sum of two numbers."""
    return {"a": a, "b": b, "operation": "add", "result": a + b}


@app.get("/subtract/{a}/{b}")
def subtract(a: float, b: float, user: dict = Depends(verify_google_token)) -> dict:
    """Return the difference of two numbers."""
    return {"a": a, "b": b, "operation": "subtract", "result": a - b}


@app.get("/multiply/{a}/{b}")
def multiply(a: float, b: float, user: dict = Depends(verify_google_token)) -> dict:
    """Return the product of two numbers."""
    return {"a": a, "b": b, "operation": "multiply", "result": a * b}


@app.get("/divide/{a}/{b}")
def divide(a: float, b: float, user: dict = Depends(verify_google_token)) -> dict:
    """Return the quotient of two numbers. Returns 400 if dividing by zero."""
    if b == 0:
        raise HTTPException(status_code=400, detail="Division by zero")
    return {"a": a, "b": b, "operation": "divide", "result": a / b}


# --- Button layout persistence ---

LAYOUT_FILE = Path(__file__).parent / "button_layout.json"


@app.get("/api/layout")
def get_layout():
    """Return the saved button layout, or empty list if none."""
    if LAYOUT_FILE.exists():
        return JSONResponse(content=json.loads(LAYOUT_FILE.read_text()))
    return JSONResponse(content=[])


@app.post("/api/layout")
async def save_layout(request: Request):
    """Save the button layout to a JSON file."""
    data = await request.json()
    LAYOUT_FILE.write_text(json.dumps(data, indent=2))
    return {"status": "ok"}


# Serve the frontend from the "static" folder
app.mount("/", StaticFiles(directory="static", html=True), name="static")
