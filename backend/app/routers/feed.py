from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.services.auth_deps import get_current_user, get_current_user as auth_required
from app.models.user import User
from app.models.conclave import Conclave
from app.models.follower import ConclaveFollower
import uuid

router = APIRouter()

@router.get("/")
async def get_feed(page: int = Query(1), db: AsyncSession = Depends(get_db)):
    per_page = 10
    result = await db.execute(
        select(Conclave).where(Conclave.is_public == True)
        .order_by(Conclave.follower_count.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    conclaves = result.scalars().all()
    return {"data": [{
        "id": str(c.id), "name": c.name, "domain": c.domain,
        "follower_count": c.follower_count,
    } for c in conclaves], "error": None}

@router.post("/{conclave_id}/follow")
async def follow_conclave(
    conclave_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(auth_required),
):
    result = await db.execute(select(Conclave).where(Conclave.id == uuid.UUID(conclave_id)))
    conclave = result.scalar_one_or_none()
    if not conclave:
        raise HTTPException(status_code=404, detail="Conclave not found")

    existing = await db.execute(
        select(ConclaveFollower).where(
            ConclaveFollower.follower_user_id == user.id,
            ConclaveFollower.conclave_id == uuid.UUID(conclave_id),
        )
    )
    if existing.scalar_one_or_none():
        return {"data": {"followed": True}, "error": None}

    follower = ConclaveFollower(follower_user_id=user.id, conclave_id=uuid.UUID(conclave_id))
    db.add(follower)
    conclave.follower_count += 1
    await db.commit()

    return {"data": {"followed": True}, "error": None}
