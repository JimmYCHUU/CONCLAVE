import uuid
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class ScenarioBranch(Base):
    __tablename__ = "scenario_branches"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("debate_sessions.id"))
    branch_type: Mapped[str] = mapped_column(String(20), nullable=False)
    disruption_event: Mapped[str | None] = mapped_column(Text, nullable=True)
    outcome_summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_signal: Mapped[str] = mapped_column(String(300), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    session: Mapped["DebateSession"] = relationship("DebateSession", back_populates="branches")
