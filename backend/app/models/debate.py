import uuid
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class DebateSession(Base):
    __tablename__ = "debate_sessions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conclave_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conclaves.id"))
    topic: Mapped[str] = mapped_column(String(500), nullable=False)
    triggered_by: Mapped[str] = mapped_column(String(50), default="scheduled")
    status: Mapped[str] = mapped_column(String(20), default="running")
    swarm_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_morning_brief: Mapped[bool] = mapped_column(Boolean, default=False)
    contrarian_activated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    branches = relationship("ScenarioBranch", back_populates="session", cascade="all, delete-orphan")

class DebateMessage(Base):
    __tablename__ = "debate_messages"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("debate_sessions.id"))
    agent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    round_number: Mapped[int] = mapped_column(Integer, nullable=False)
    is_swarm: Mapped[bool] = mapped_column(Boolean, default=False)
    is_contrarian_round: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
