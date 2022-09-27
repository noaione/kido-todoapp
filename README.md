# Kidocode — Todo Application

This is a sample project using Firebase as database for a simple todo application.

This project use the following stack:
- FastAPI (Framework)
- firebase-admin (Firebase connection)
- Jinja2 (Template rendering)
- orjson (Fast JSON parsing (!))

## Installation and Running
0. Make sure you have [Poetry](https://python-poetry.org/docs/)
1. Run `poetry install` on the root project directory
2. Enter the virtual environment using:
   - Windows: `.\.venv\Scripts\activate`
   - Linux/macOS: `source ./.venv/bin/activate`
3. Run with uvicorn or directly executing the `app.py` file
   - Uvicorn: `uvicorn app:app --host 0.0.0.0 --port 4540`
   - Directly: `python app.py`
