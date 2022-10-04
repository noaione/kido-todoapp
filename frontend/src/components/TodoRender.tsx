import React from "react";
import { selectTodo, Todo } from "../lib/features/todoSlice";
import { useStoreSelector } from "../lib/store";

interface TodoRenderProps {
    todo: Todo;
}

function SingleTodoRender(props: TodoRenderProps) {
    const { todo } = props;
    return (
        <div
            className="flex flex-col border-t-2 border-b-2 border-gray-600 lg:flex-row gap-2 justify-center items-center py-1 bg-gray-800"
            id={`todo-${todo.id}`}
        >
            <div className="flex whitespace-pre-wrap py-2 text-gray-200">
                <p>{todo.text}</p>
            </div>
            <div className="flex flex-col gap-1 pb-2">
                <button className="bg-yellow-500 hover:bg-yellow-400 transition text-white px-2 py-1 rounded-md">
                    Edit
                </button>
                <button className="bg-red-500 hover:bg-red-400 transition text-white px-2 py-1 rounded-md">
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function TodoRender() {
    const todos = useStoreSelector(selectTodo);

    return (
        <div className="flex flex-col pt-2 pb-4 mx-auto my-4">
            {todos.map((todo) => {
                return <SingleTodoRender key={todo.id} todo={todo} />;
            })}
        </div>
    );
}
