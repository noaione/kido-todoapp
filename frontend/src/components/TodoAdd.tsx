import React, { useState } from "react";

export default function TodoAddSection() {
    const [textState, setTextState] = useState("");
    const [isSubmit, setSubmit] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center mx-auto gap-2">
            <div className="flex">
                <input
                    type="text"
                    className="form-input rounded-md px-2 py-2 bg-gray-800 text-white disabled:bg-gray-700 disabled:text-gray-200 disabled:cursor-not-allowed"
                    value={textState}
                    onChange={(ev) => setTextState(ev.target.value)}
                    disabled={isSubmit}
                />
            </div>
            <div className="flex">
                <button
                    className="bg-green-500 hover:bg-green-400 disabled:bg-green-700 disabled:cursor-not-allowed transition text-white px-3 py-2 rounded-md"
                    disabled={isSubmit}
                    onClick={() => {
                        setSubmit(true);
                        fetch("/todos", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                text: textState,
                                status: "ONGOING",
                            }),
                        })
                            .then((resp) => resp.json())
                            .then(() => {
                                setTextState("");
                                setSubmit(false);
                                return;
                            });
                    }}
                >
                    Add
                </button>
            </div>
        </div>
    );
}
