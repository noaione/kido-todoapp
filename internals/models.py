from dataclasses import dataclass
from typing import Generic, Literal, Optional, TypeVar
from uuid import uuid4

from pydantic.generics import GenericModel
from fastapi.responses import ORJSONResponse

TodoStatus = Literal["ONGOING", "DONE", "CANCELED"]
DataType = TypeVar("DataType")


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


class ResponseType(GenericModel, Generic[DataType]):
    error: str = "Success"
    code: int = 200
    data: Optional[DataType] = None

    def to_orjson(self, status: int = 200):
        return ORJSONResponse(self.dict(), status_code=status)
