import asyncio
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sse_starlette.sse import EventSourceResponse

from internals.firebase import FirebaseDatabase
from internals.models import PartialTodo, ResponseType, Todo, compare_text
from internals.sse import SSEManager, SSEUser

ROOT_DIR = Path(__file__).absolute().parent
app = FastAPI()
db = FirebaseDatabase("kidotodo")
ssemanager = SSEManager()

app.mount("/static", StaticFiles(directory=ROOT_DIR / "public"), name="static")
templates = Jinja2Templates(directory=ROOT_DIR / "views")


@app.on_event("startup")
async def fastapi_startup():
    task = asyncio.create_task(ssemanager.startup())
    app.extra["sse_task"] = task


@app.on_event("shutdown")
async def fastapi_shutdown():
    task = app.extra.get("sse_task")
    if task:
        task.cancel()


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/todos", response_model=ResponseType[List[Todo]])
async def todos_get():
    todo_list: List[Todo] = []
    async for todo in db.get_collection("todos"):
        if todo is None:
            continue
        todo_list.append(Todo.from_dict(todo).to_dict())
    return ResponseType[List[Todo]](data=todo_list).to_orjson()


@app.get("/todos/{todo_id}", response_model=ResponseType[Todo])
async def todo_get(todo_id: str):
    todo_ref = await db.get_document("todos", todo_id)
    if todo_ref is None:
        return ResponseType(error="Specified todo is not found!", code=404).to_orjson(404)
    return ResponseType[Todo](data=Todo.from_dict(todo_ref).to_dict()).to_orjson()


@app.post("/todos", response_model=ResponseType[Todo])
async def todos_post(todo: PartialTodo):
    if todo.text is None:
        return ResponseType(error="text parameter is required", code=400).to_orjson(400)
    request_at = int(round(datetime.utcnow().timestamp()))
    actual_todo = todo.to_todo(request_at=request_at)
    await db.set_document("todos", actual_todo.id, actual_todo.to_dict())
    await ssemanager.publish("TodoCreated", actual_todo.to_dict())
    return ResponseType[Todo](data=actual_todo.to_dict()).to_orjson()


@app.patch("/todos/{todo_id}", response_model=ResponseType[Todo])
async def todos_patch(todo_id: str, todo: PartialTodo):
    todo_ref = await db.get_document("todos", todo_id)
    if todo_ref is None:
        return ResponseType(error="Specified todo is not found!", code=404).to_orjson(404)

    todo_actual = Todo.from_dict(todo_ref)
    any_changed = False
    if todo_actual.status != todo.status:
        todo_actual.status = todo.status
        any_changed = True
    if todo.text is not None and not compare_text(todo_actual.text, todo.text):
        todo_actual.text = todo.text
        any_changed = True

    if not any_changed:
        return ResponseType(error="There's no changes applied!", code=400).to_orjson(400)

    todo_actual.updated_at = int(round(datetime.utcnow().timestamp()))
    await db.set_document("todos", todo_id, todo_actual.to_dict())
    await ssemanager.publish("TodoUpdated", todo_actual.to_dict())
    return ResponseType[Todo](data=todo_actual.to_dict()).to_orjson()


@app.delete("/todos/{todo_id}")
async def todos_delete(todo_id: str):
    todo_ref = await db.get_document("todos", todo_id)
    if todo_ref is None:
        return ResponseType(error="Specified todo is not found!", code=404).to_orjson(404)
    await db.delete_document("todos", todo_id)
    await ssemanager.publish("TodoDeleted", {"id": todo_id})
    # Return code 204 is for successful deletion
    return Response(status_code=204)


@app.get("/sse/todos")
async def todos_sse(request: Request):
    user = SSEUser(request)
    await ssemanager.subscribe(user)

    async def generator():
        while True:
            if await request.is_disconnected():
                await ssemanager.unsubscribe(user)
                break

            message = await user.get()
            yield message.to_event()

            await asyncio.sleep(1)

    return EventSourceResponse(generator())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4540)
