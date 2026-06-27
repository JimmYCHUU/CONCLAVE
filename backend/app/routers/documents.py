from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.document import AddDocumentRequest
from app.services.auth_deps import get_current_user
from app.services.document_service import add_document, get_documents
from app.models.user import User

router = APIRouter()

@router.post("/{conclave_id}/documents", status_code=201)
async def add_document_endpoint(
    conclave_id: str, req: AddDocumentRequest,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    try:
        doc = await add_document(db, conclave_id, req.url, req.text)
        return {"data": doc, "error": None}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{conclave_id}/documents")
async def get_documents_endpoint(
    conclave_id: str,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    docs = await get_documents(db, conclave_id)
    return {"data": docs, "error": None}
