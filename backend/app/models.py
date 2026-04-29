from __future__ import annotations

import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    price_history:  Mapped[list["PriceHistory"]] = relationship(
        back_populates="flight_watch",
        cascade="all, delete-orphan",
        order_by=lambda: (PriceHistory.checked_at.desc(), PriceHistory.id.desc()),
    )


class PriceHistory(Base):
    __tablename__ = "price_history"

    id:              Mapped[int]               = mapped_column(primary_key=True, index=True)
    flight_watch_id: Mapped[int]               = mapped_column(ForeignKey("flight_watches.id", ondelete="CASCADE"), nullable=False, index=True)
    price:           Mapped[Decimal]           = mapped_column(Numeric(10, 2), nullable=False)
    currency:        Mapped[str]               = mapped_column(String(10), nullable=False)
    checked_at:      Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), index=True)
    source_name:     Mapped[Optional[str]]     = mapped_column(String(100), nullable=True)

    flight_watch: Mapped["FlightWatch"] = relationship(back_populates="price_history")
