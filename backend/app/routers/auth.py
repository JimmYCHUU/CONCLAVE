from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_user, login_user

router = APIRouter()

@router.post("/register", status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await register_user(db, req.email, req.username, req.password, req.domain)
        return {"data": result, "error": None}
    except ValueError as e:
        code = str(e)
        raise HTTPException(status_code=409, detail={"code": code, "detail": code.lower().replace("_", " ")})

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await login_user(db, req.email, req.password)
        return {"data": result, "error": None}
    except ValueError as e:
        raise HTTPException(status_code=401, detail={"code": "INVALID_CREDENTIALS", "detail": "Invalid email or password"})
