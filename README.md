# Kidocode — Todo Application

This is a sample project using Firebase as database for a simple todo application.

**This project backend use the following stack**:
- Asynchronous Python
- Poetry (Package Manager)
- FastAPI (Framework)
- firebase-admin (Firebase connection)
- Jinja2 (Template rendering)
- orjson (Fast JSON parsing (!))
- Flake8/Black/isort (Linter)

**This project frontend use the following stack**:
- TypeScript
- PNPM (Package Manager)
- React (JS Framework)
- Webpack (JS Bundler)
- PostCSS (CSS Bundler)
- TailwindCSS (CSS Framework)
- swc (Fast TypeScript Compiler)
- ESLint/Prettier (Linter)

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
0. Make sure you have [Poetry](https://python-poetry.org/docs/) and [pnpm](https://pnpm.io/installation)
1. Run `poetry install` on the root project directory
2. Run `pnpm i` on root project directory to initialize our frontend workspace
3. Enter the virtual environment using:
   - Windows: `.\.venv\Scripts\activate`
   - Linux/macOS: `source ./.venv/bin/activate`
4. Run with uvicorn
   - Uvicorn: `uvicorn app:app --host 127.0.0.1 --port 4540 --reload --reload-include "*.tsx" --reload-include "*.ts" --reload-include "*.css" --reload-dir frontend`

