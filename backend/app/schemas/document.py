from pydantic import BaseModel

class AddDocumentRequest(BaseModel):
    url: str | None = None
    text: str | None = None
