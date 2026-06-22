@echo off
echo ============================================
echo  ITE Startup Launch Pad — Starting Server
echo ============================================
cd /d "%~dp0backend"
echo Installing Python dependencies...
py -m pip install -r requirements.txt -q
echo.
echo Starting FastAPI server on http://localhost:8000
echo API Docs available at http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server.
echo ============================================
py -m uvicorn main:app --reload --port 8000
