#!/bin/bash
echo "============================================"
echo " ITE Startup Launch Pad — Starting Server"
echo "============================================"
cd "$(dirname "$0")/backend"
echo "Installing Python dependencies..."
py -m pip install -r requirements.txt -q || python3 -m pip install -r requirements.txt -q
echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "API Docs available at http://localhost:8000/docs"
echo ""
py -m uvicorn main:app --reload --port 8000 || python3 -m uvicorn main:app --reload --port 8000
