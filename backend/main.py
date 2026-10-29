"""
CampusBus AI - FastAPI Application Server
Provides REST endpoints for buses, routes, timetables, and rule-based chatbot.
Also serves the vanilla HTML/CSS/JS frontend.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any

from .data import (
    get_all_buses,
    get_bus_by_number,
    get_all_routes,
    get_route_by_id,
    CAMPUS_LOCATION,
)
from .chatbot import process_chat_message

app = FastAPI(
    title="CampusBus AI API",
    description="Smart College Bus Tracking and Student Assistance System",
    version="1.0.0"
)

# Enable CORS so frontend development is completely friction-free
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# ----------------- API ENDPOINTS -----------------

@app.get("/api/campus")
def get_campus_coords() -> Dict[str, Any]:
    """Returns college campus destination location."""
    return CAMPUS_LOCATION

@app.get("/api/buses")
def api_get_buses() -> List[Dict[str, Any]]:
    """Returns real-time status of all campus buses."""
    return get_all_buses()

@app.get("/api/buses/{bus_number}")
def api_get_bus_by_number(bus_number: str) -> Dict[str, Any]:
    """Returns details for a specific bus number."""
    bus = get_bus_by_number(bus_number)
    if not bus:
        raise HTTPException(status_code=404, detail=f"Bus #{bus_number} not found")
    return bus

@app.get("/api/routes")
def api_get_routes() -> List[Dict[str, Any]]:
    """Returns all active bus routes with their stop sequences."""
    return get_all_routes()

@app.get("/api/routes/{route_id}")
def api_get_route_by_id(route_id: str) -> Dict[str, Any]:
    """Returns details and stops for a single route."""
    route = get_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found")
    return route

@app.post("/api/chat", response_model=ChatResponse)
def api_chat(req: ChatRequest) -> ChatResponse:
    """Processes student inquiries using rule-based reasoning with Tanglish support."""
    answer = process_chat_message(req.message)
    return ChatResponse(reply=answer)

# ----------------- STATIC FRONTEND MOUNT -----------------

# Locate frontend directory relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "frontend"))

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    print("Starting CampusBus AI server at http://127.0.0.1:8000 ...")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
