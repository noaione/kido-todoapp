import React, { useState } from "react";
import { lockTodo, selectLockedTodo } from "../lib/features/todoSlice";
import { useStoreSelector } from "../lib/store";

const noop = () => {
    return;
};

export default function TodoDeleteButton(props: { id: string }) {
    const [isSubmit, setSubmitState] = useState(false);
    const lockedState = useStoreSelector(selectLockedTodo);
    const [timerCd, setTimerCd] = useState(0);
    const [timer, setTimer] = useState<NodeJS.Timer | null>(null);
    const { id } = props;

    const isLocked = lockedState.includes(id);
    const isDisabled = isLocked || isSubmit;

    return (
        <button
            disabled={isDisabled}
            className="bg-red-500 hover:bg-red-400 disabled:bg-red-700 disabled:cursor-not-allowed transition text-white px-2 py-1 rounded-md"
            onClick={(ev) => {
                ev.preventDefault();
                if (timer !== null) {
                    ev.preventDefault();
                    setSubmitState(true);
                    clearInterval(timer);
                    setTimer(null);
                    setTimerCd(0);
                    lockTodo(id);
                    fetch(`/todos/${id}`, {
                        method: "DELETE",
                    })
                        .then((resp) => resp.text())
                        .then(noop);
                } else {
                    setTimerCd(5);
                    const idTimer = setInterval(() => {
                        setTimerCd((prev) => {
                            const newD = prev - 1;
                            if (newD <= 0) {
                                clearInterval(idTimer);
                                setTimer(null);
                                setTimerCd(0);
                            }
                            return newD;
                        });
                    }, 1000);
                    setTimer(idTimer);
                }
            }}
        >
            {timerCd > 0 ? `Confirm Delete (${timerCd}s)` : "Delete"}
        </button>
    );
}
