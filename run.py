"""
CampusBus AI - Application Entry Point
Run this script to start the server:
    python run.py
"""

import sys
import uvicorn

# Ensure utf-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

if __name__ == "__main__":
    print("=" * 60)
    print(" [CampusBus AI] Phase 1 Starting...")
    print(" Open your browser at: http://127.0.0.1:8000")
    print(" API Documentation at: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
