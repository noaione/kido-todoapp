from typing import Literal, Optional
from dataclasses import dataclass
from uuid import uuid4


TodoStatus = Literal["ONGOING", "DONE", "CANCELED"]


@dataclass
class Todo:
    id: str
    text: str
    status: TodoStatus
    created_at: int
    updated_at: int

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data["id"],
            text=data["text"],
            status=data["status"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
        )


@dataclass
class PartialTodo:
    text: Optional[str] = None
    status: Optional[TodoStatus] = None

    def __post_init__(self):
        if self.status is None:
            self.status = "ONGOING"

    def to_dict(self):
        return {"text": self.text, "status": self.status}

    @classmethod
    def from_dict(cls, data: dict):
        return cls(text=data["text"], status=data["status"])

    def to_todo(self, request_at: int):
        if self.text is None:
            raise ValueError("Text is required")
        return Todo(
            id=str(uuid4()),
            text=self.text,
            status=self.status,
            created_at=request_at,
            updated_at=request_at,
        )
