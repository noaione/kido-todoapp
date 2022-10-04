import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Todo } from "./lib/features/todoSlice";
import { ResponseGeneric } from "./lib/types";
import TodoRender from "./components/TodoRender";
import "./styles/app.css";

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
    constructor(props: PropsFromRedux) {
        super(props);

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

        console.info(data);

        this.props.addTodos(data);
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
            </>
        );
    }
}

export default connector(AppRoot);
