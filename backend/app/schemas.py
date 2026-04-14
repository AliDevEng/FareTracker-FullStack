from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_validator


class FlightWatchCreate(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    is_round_trip: bool = False
    target_price: Decimal
    currency: str = "SEK"
    is_active: bool = True

    @field_validator("target_price")
    @classmethod
    def target_price_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("target_price must be greater than 0")
        return v


class FlightWatchUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    is_round_trip: Optional[bool] = None
    target_price: Optional[Decimal] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("target_price")
    @classmethod
    def target_price_must_be_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("target_price must be greater than 0")
        return v


class FlightWatchResponse(BaseModel):
    id: int
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date]
    is_round_trip: bool
    target_price: Decimal
    current_price: Optional[Decimal]
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
