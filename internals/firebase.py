import firebase_admin
from firebase_admin import credentials, firestore_async
from pathlib import Path
import orjson

ROOT_DIR = Path(__file__).absolute().parent.parent
__all__ = ("FirebaseDatabase",)


def find_service_account():
    """Find the service account file in the current directory."""
    CREDS_FOLDER = ROOT_DIR / "creds"
    if not CREDS_FOLDER.exists():
        raise FileNotFoundError("The creds folder does not exist.")
    for file in CREDS_FOLDER.glob("*.json"):
        load_data = orjson.loads(file.read_bytes())
        if load_data.get("type") == "service_account":
            return file
    raise FileNotFoundError("No service account file found.")


class FirebaseDatabase:
    def __init__(self, name: str) -> None:
        cred_file = find_service_account()
        print(f"Using credentials: {cred_file}")
        cred = credentials.Certificate(cred_file)
        self._app = firebase_admin.initialize_app(cred, name=name)
        self._db = firestore_async.client(self._app)

    @property
    def db(self):
        return self._db

    async def get_collection(self, collection: str):
        doc_ref = self._db.collection(collection)
        docs = doc_ref.stream()
        async for doc in docs:
            yield doc.to_dict()

    async def get_document(self, collection: str, document_id: str):
        doc_ref = self._db.collection(collection).document(document_id)
        doc = await doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None

    async def set_document(self, collection: str, document_id: str, document: dict):
        doc_ref = self._db.collection(collection).document(document_id)
        await doc_ref.set(document)

    async def delete_document(self, collection: str, document_id: str):
        doc_ref = self._db.collection(collection).document(document_id)
        await doc_ref.delete()
