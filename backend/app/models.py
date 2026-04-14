from sqlalchemy import Boolean, Column, Date, Numeric, String, TIMESTAMP, func
from sqlalchemy.orm import mapped_column, Mapped
from typing import Optional
import datetime
from decimal import Decimal

from app.database import Base


class FlightWatch(Base):
    __tablename__ = "flight_watches"

    id:             Mapped[int]              = mapped_column(primary_key=True, index=True)
    origin:         Mapped[str]              = mapped_column(String(100), nullable=False)
    destination:    Mapped[str]              = mapped_column(String(100), nullable=False)
    departure_date: Mapped[datetime.date]    = mapped_column(Date, nullable=False)
    return_date:    Mapped[Optional[datetime.date]]    = mapped_column(Date, nullable=True)
    is_round_trip:  Mapped[bool]             = mapped_column(Boolean, nullable=False, default=False)
    target_price:   Mapped[Decimal]          = mapped_column(Numeric(10, 2), nullable=False)
    current_price:  Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    currency:       Mapped[str]              = mapped_column(String(10), nullable=False, default="SEK")
    is_active:      Mapped[bool]             = mapped_column(Boolean, nullable=False, default=True)
    created_at:     Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at:     Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())
