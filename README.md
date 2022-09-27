# Kidocode — Todo Application

This is a sample project using Firebase as database for a simple todo application.

**This project use the following stack**:
- Asynchronous Python
- FastAPI (Framework)
- firebase-admin (Firebase connection)
- Jinja2 (Template rendering)
- orjson (Fast JSON parsing (!))

## Preparing
1. You should have a Firebase account ready
2. Create a new Firestore database
3. Download the Service account JSON data
   1. Open `Settings`
   2. Click `Project Settings`
   3. Click `Service accounts`
   4. Click `Firebase Admin SDK`
   5. Click `Create new Private Key`
4. Put the downloaded JSON file to the `creds` folder

## Installation and Running
0. Make sure you have [Poetry](https://python-poetry.org/docs/)
1. Run `poetry install` on the root project directory
2. Enter the virtual environment using:
   - Windows: `.\.venv\Scripts\activate`
   - Linux/macOS: `source ./.venv/bin/activate`
3. Run with uvicorn or directly executing the `app.py` file
   - Uvicorn: `uvicorn app:app --host 0.0.0.0 --port 4540`
   - Directly: `python app.py`
