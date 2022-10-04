import React from "react";
import ReactDOM from "react-dom/client";

import { Provider } from "react-redux";
import store from "./lib/store";

import App from "./App";
import "./styles/app.css";

const domRoot = document.getElementById("root") as HTMLDivElement | null;
if (domRoot === null) {
    throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(domRoot);
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);
