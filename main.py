"""
Simple REST API that doubles a number.

Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI

app = FastAPI()


@app.get("/double/{number}")
def double(number: int) -> dict:
    """Receive a number via URL path and return its double."""
    return {"number": number, "result": number * 2}
