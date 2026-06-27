from pydantic import BaseModel

class CreateConclaveRequest(BaseModel):
    name: str
    domain: str

class UpdateConclaveRequest(BaseModel):
    is_public: bool | None = None
    name: str | None = None

class ConclaveResponse(BaseModel):
    id: str
    name: str
    domain: str
    is_public: bool
    follower_count: int
    agents: list[dict]
