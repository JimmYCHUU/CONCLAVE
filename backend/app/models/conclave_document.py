import uuid
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ConclaveDocument(Base):
    __tablename__ = "conclave_documents"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conclave_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conclaves.id"))
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content_preview: Mapped[str] = mapped_column(Text, nullable=False)
    entity_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
