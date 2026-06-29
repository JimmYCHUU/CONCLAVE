import hashlib
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User

def _prehash(password: str) -> bytes:
    return hashlib.sha256(password.encode()).digest()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_prehash(plain), hashed.encode())

def create_token(user_id: str) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiry_hours)
    payload = {"sub": user_id, "exp": expiry}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None

async def register_user(db: AsyncSession, email: str, username: str, password: str, domain: str) -> dict:
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ValueError("EMAIL_EXISTS")

    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        raise ValueError("USERNAME_TAKEN")

    user = User(
        email=email,
        username=username,
        hashed_password=hash_password(password),
        domain=domain,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token(str(user.id))
    return {
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "access_token": token,
    }

async def login_user(db: AsyncSession, email: str, password: str) -> dict:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("INVALID_CREDENTIALS")

    token = create_token(str(user.id))
    return {
        "access_token": token,
        "user_id": str(user.id),
        "username": user.username,
    }
