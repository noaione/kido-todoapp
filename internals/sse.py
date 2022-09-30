import asyncio
import time
from dataclasses import dataclass, field
from typing import Any, Set

import orjson
from fastapi import Request
from sse_starlette.sse import ServerSentEvent


@dataclass
class SSEMessage:
    event: str
    data: Any = field(repr=False)
    timestamp: int = field(default_factory=lambda: int(round(time.time() * 1000)))

    def encode_data(self):
        if self.data is None:
            return None
        if isinstance(self.data, str):
            return self.data
        elif isinstance(self.data, (int, float)):
            return str(self.data)
        elif isinstance(self.data, bytes):
            return self.data.decode()
        elif isinstance(self.data, bool):
            return str(self.data).lower()
        return orjson.dumps(
            self.data,
            option=orjson.OPT_SERIALIZE_NUMPY | orjson.OPT_SERIALIZE_DATACLASS | orjson.OPT_SERIALIZE_UUID,
        ).decode("utf-8")

    def to_event(self):
        return ServerSentEvent(self.encode_data(), event=self.event, id=self.timestamp)


class SSEUser:
    def __init__(self, request: Request):
        self.__request = request
        self.__msg_queue = asyncio.Queue[SSEMessage]()

    async def get(self):
        return await self.__msg_queue.get()

    async def put(self, msg: SSEMessage):
        await self.__msg_queue.put(msg)


class SSEManager:
    def __init__(self):
        self._messages = asyncio.Queue[SSEMessage]()
        self._clients: Set[SSEUser] = set()

    async def publish(self, event: str, data: Any):
        await self._messages.put(SSEMessage(event, data))

    async def subscribe(self, client: SSEUser):
        self._clients.add(client)

    async def unsubscribe(self, client: SSEUser):
        self._clients.remove(client)

    async def startup(self):
        print("Starting SSEManager...")
        while True:
            message = await self._messages.get()
            print(f"[SSE] Publishing: {message.event}")
            for client in self._clients:
                await client.put(message)
