import uuid
from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conclave_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conclaves.id"))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    personality_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    bias_description: Mapped[str] = mapped_column(String(500), nullable=False)
    accuracy_score: Mapped[float] = mapped_column(Float, default=0.5)
    calibration_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_predictions: Mapped[int] = mapped_column(Integer, default=0)
    correct_predictions: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    conclave = relationship("Conclave", back_populates="agents")
