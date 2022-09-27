from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import HTMLResponse, ORJSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from internals.firebase import FirebaseDatabase
from internals.models import PartialTodo, Todo

ROOT_DIR = Path(__file__).absolute().parent
app = FastAPI()
db = FirebaseDatabase("kidotodo")

app.mount("/static", StaticFiles(directory=ROOT_DIR / "public"), name="static")
templates = Jinja2Templates(directory=ROOT_DIR / "views")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/todos", response_model=List[Todo])
async def todos_get():
    todo_list: List[Todo] = []
    async for todo in db.get_collection("todos"):
        if todo is None:
            continue
        todo_list.append(Todo.from_dict(todo))
    return ORJSONResponse(todo_list)


@app.post("/todos", response_model=Todo)
async def todos_post(todo: PartialTodo):
    if todo.text is None:
        raise HTTPException(status_code=400, detail="Text is required")
    request_at = int(round(datetime.utcnow().timestamp()))
    actual_todo = todo.to_todo(request_at=request_at)
    await db.set_document("todos", actual_todo.id, actual_todo.to_dict())
    return ORJSONResponse(actual_todo.to_dict())


@app.patch("/todos/{todo_id}", response_model=Todo)
async def todos_patch(todo_id: str, todo: PartialTodo):
    todo_ref = await db.get_document("todos", todo_id)
    if todo_ref is None:
        return HTTPException(status_code=404, detail="Todo not found")

    todo_actual = Todo.from_dict(todo_ref)
    any_changed = False
    if todo_actual.status != todo.status:
        todo_actual.status = todo.status
        any_changed = True
    if todo.text is not None:
        todo_actual.text = todo.text
        any_changed = True

    if not any_changed:
        raise HTTPException(status_code=400, detail="No changes")

    todo_actual.updated_at = int(round(datetime.utcnow().timestamp()))
    await db.set_document("todos", todo_id, todo_actual.to_dict())
    return ORJSONResponse(todo_actual.to_dict())


@app.delete("/todos/{todo_id}")
async def todos_delete(todo_id: str):
    todo_ref = await db.get_document("todos", todo_id)
    if todo_ref is None:
        return HTTPException(status_code=404, detail="Todo not found")
    await db.delete_document("todos", todo_id)
    # Return code 204 is for successful deletion
    return Response(status_code=204)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4540)
