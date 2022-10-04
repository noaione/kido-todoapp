import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type TodoStatus = "ONGOING" | "DONE" | "CANCELED";

export interface Todo {
    id: string;
    text: string;
    status: TodoStatus;
    created_at: number;
    updated_at: number;
}

interface TodoState {
    todos: Todo[];
    lockedTodo: string[];
}

const initialState: TodoState = {
    todos: [],
    lockedTodo: [],
};

export const todoSlice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        addTodo: (state, action: PayloadAction<Todo>) => {
            state.todos.push(action.payload);
        },
        updateTodo: (state, action: PayloadAction<Todo>) => {
            const index = state.todos.findIndex((todo) => todo.id === action.payload.id);
            if (index !== -1) {
                state.todos[index] = action.payload;
            }
        },
        deleteTodo: (state, action: PayloadAction<string>) => {
            const index = state.todos.findIndex((todo) => todo.id === action.payload);
            if (index !== -1) {
                state.todos.splice(index, 1);
            }
        },
        expunge: (state) => {
            state.todos = [];
        },
        bulkAddTodo: (state, action: PayloadAction<Todo[]>) => {
            state.todos = action.payload;
        },
        lockTodo: (state, action: PayloadAction<string>) => {
            state.lockedTodo.push(action.payload);
        },
        removeLockTodo: (state, action: PayloadAction<string>) => {
            const index = state.lockedTodo.findIndex((todo) => todo === action.payload);
            if (index !== -1) {
                state.lockedTodo.splice(index, 1);
            }
        },
    },
});

export const { addTodo, updateTodo, deleteTodo, lockTodo, removeLockTodo } = todoSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectTodo = (state: RootState) => state.todos.todos;
export const selectLockedTodo = (state: RootState) => state.todos.lockedTodo;

export default todoSlice.reducer;
