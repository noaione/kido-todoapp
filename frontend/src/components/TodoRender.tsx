import React, { useState } from "react";
import { lockTodo, removeLockTodo, selectLockedTodo, selectTodo, Todo, TodoStatus } from "../lib/features/todoSlice";
import { useStoreDispatch, useStoreSelector } from "../lib/store";
import TodoDeleteButton from "./TodoDeleteButton";

interface TodoRenderProps {
    todo: Todo;
}

function capitalize(str: string) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

function CustomTriState(props: { isLocked: boolean; status: TodoStatus; onChanged: (newStatus: TodoStatus) => void }) {
    const { status, isLocked } = props;
    const btnColor = {
        ONGOING: "bg-yellow-500 disabled:bg-yellow-600",
        DONE: "bg-green-500 disabled:bg-green-600",
        CANCELED: "bg-red-500 disabled:bg-red-600",
    };

    return (
        <button
            disabled={isLocked}
            className={`px-2 py-1 rounded-md ${btnColor[status]} text-white font-bold hover:opacity-75 transition-opacity`}
            onClick={() => {
                switch (status) {
                    case "ONGOING":
                        props.onChanged("DONE");
                        break;
                    case "DONE":
                        props.onChanged("CANCELED");
                        break;
                    case "CANCELED":
                        props.onChanged("ONGOING");
                        break;
                }
            }}
        >
            {capitalize(status)}
        </button>
    );
}

function SingleTodoRender(props: TodoRenderProps) {
    const [isEdit, setIsEdit] = useState(false);
    const lockedTodos = useStoreSelector(selectLockedTodo);
    const dispatcher = useStoreDispatch();
    const { todo } = props;

    const [todoText, setTodoText] = useState(todo.text);
    const [todoStatus, setTodoStatus] = useState(todo.status);

    const statusColor = {
        DONE: "text-green-500",
        ONGOING: "text-yellow-500",
        CANCELED: "text-red-500",
    };

    const isLocked = lockedTodos.includes(todo.id);
    return (
        <div
            className="flex flex-col border-t-2 border-b-2 border-gray-600 lg:flex-row gap-2 justify-center items-center py-1 bg-gray-800"
            id={`todo-${todo.id}`}
        >
            <div className="flex flex-col whitespace-pre-wrap py-2 text-gray-200 items-end text-end">
                {isEdit ? (
                    <input
                        type="text"
                        className="form-input px-2 py-2 bg-gray-900 text-white"
                        value={todoText}
                        onChange={(ev) => setTodoText(ev.target.value)}
                    />
                ) : (
                    <p className={isLocked ? "animate-pulse" : ""}>{todoText}</p>
                )}
                {isEdit ? (
                    <CustomTriState status={todoStatus} onChanged={(newS) => setTodoStatus(newS)} isLocked={isLocked} />
                ) : (
                    <p className={statusColor[todoStatus]}>{capitalize(todoStatus)}</p>
                )}
            </div>
            <div className="flex flex-col gap-1 pb-2">
                <button
                    className={`${
                        isEdit
                            ? "bg-green-500 hover:bg-green-400 disabled:bg-green-600"
                            : "bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-600"
                    } disabled:cursor-not-allowed transition text-white px-2 py-1 rounded-md`}
                    disabled={isLocked}
                    onClick={(ev) => {
                        ev.preventDefault();
                        if (isEdit) {
                            // submit first
                            dispatcher(lockTodo(todo.id));
                            fetch(`/todos/${todo.id}`, {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    text: todoText,
                                    status: todoStatus,
                                }),
                            })
                                .then((resp) => {
                                    return resp.json();
                                })
                                .then((_) => {
                                    dispatcher(removeLockTodo(todo.id));
                                    setIsEdit(false);
                                });
                        } else {
                            setIsEdit(true);
                        }
                    }}
                >
                    {isEdit ? "Done" : "Edit"}
                </button>
                <TodoDeleteButton id={todo.id} />
            </div>
        </div>
    );
}

export default function TodoRender() {
    const todos = useStoreSelector(selectTodo);
    const sortedTodos = [...todos];
    sortedTodos.sort((a, b) => a.created_at - b.created_at);

    return (
        <div className="flex flex-col pt-2 pb-4 mx-auto my-4">
            {sortedTodos.map((todo) => {
                return <SingleTodoRender key={todo.id} todo={todo} />;
            })}
        </div>
    );
}
