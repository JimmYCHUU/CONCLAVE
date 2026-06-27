import uuid
from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ConclaveFollower(Base):
    __tablename__ = "conclave_followers"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    conclave_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conclaves.id"))
    followed_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
