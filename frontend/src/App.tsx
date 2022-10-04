import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Todo } from "./lib/features/todoSlice";
import { ResponseGeneric } from "./lib/types";
import TodoRender from "./components/TodoRender";
import TodoSSEReceiver from "./lib/sse";
import "./styles/app.css";
import TodoAddSection from "./components/TodoAdd";

const mapDispatch = {
    resetState: () => ({ type: "todo/expunge" }),
    addTodo: (payload: Todo) => ({ type: "todo/addTodo", payload }),
    addTodos: (payload: Todo[]) => ({ type: "todo/bulkAddTodo", payload }),
    updateTodo: (payload: Todo) => ({ type: "todo/updateTodo", payload }),
    deleteTodo: (payload: string) => ({ type: "todo/deleteTodo", payload }),
};
const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface AppState {
    isLoading: boolean;
}

class AppRoot extends React.Component<PropsFromRedux, AppState> {
    sseReceiver: TodoSSEReceiver;
    constructor(props: PropsFromRedux) {
        super(props);

        this.handleAddTodo = this.handleAddTodo.bind(this);
        this.handleUpdateTodo = this.handleUpdateTodo.bind(this);
        this.handleDeleteTodo = this.handleDeleteTodo.bind(this);

        this.sseReceiver = new TodoSSEReceiver("/sse/todos");
        this.sseReceiver.on("TodoCreated", (data) => {
            this.handleAddTodo(data);
        });
        this.sseReceiver.on("TodoUpdated", this.handleUpdateTodo);
        this.sseReceiver.on("TodoDeleted", this.handleDeleteTodo);

        this.state = {
            isLoading: true,
        };
    }

    async componentDidMount() {
        const request = await fetch("/todos");
        const todoResponse = (await request.json()) as ResponseGeneric<Todo[]>;

        if (todoResponse.code !== 200) {
            this.setState({ isLoading: false });
            return;
        }

        const { data } = todoResponse;
        if (data === null) {
            this.setState({ isLoading: false });
            return;
        }

        this.props.addTodos(data);
    }

    handleAddTodo(payload: Todo) {
        this.props.addTodo(payload);
    }

    handleUpdateTodo(payload: Todo) {
        this.props.updateTodo(payload);
    }

    handleDeleteTodo(payload: Pick<Todo, "id">) {
        this.props.deleteTodo(payload.id);
    }

    componentWillUnmount(): void {
        this.sseReceiver.shutdown();
    }

    render(): React.ReactNode {
        return (
            <>
                <div className="flex flex-col pt-10">
                    <h1 className="text-center text-3xl">
                        <span className="font-light">Kido</span>
                        <span className="font-bold">Todo</span>
                    </h1>
                </div>
                <TodoRender />
                <TodoAddSection />
            </>
        );
    }
}

export default connector(AppRoot);
