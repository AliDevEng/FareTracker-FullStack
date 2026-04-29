from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app import models, schemas


def create(
    db: Session,
    payload: schemas.PriceHistoryCreate,
) -> models.PriceHistory:
    history_row = models.PriceHistory(**payload.model_dump())
    db.add(history_row)
    db.commit()
    db.refresh(history_row)
    return history_row


def create_for_watch(
    db: Session,
    watch_id: int,
    *,
    price: Decimal,
    currency: str,
    source_name: Optional[str] = None,
) -> models.PriceHistory:
    payload = schemas.PriceHistoryCreate(
        flight_watch_id=watch_id,
        price=price,
        currency=currency,
        source_name=source_name,
    )
    return create(db, payload)


def get_for_watch(
    db: Session,
    watch_id: int,
    *,
    limit: Optional[int] = None,
) -> list[models.PriceHistory]:
    query = (
        db.query(models.PriceHistory)
        .filter(models.PriceHistory.flight_watch_id == watch_id)
        .order_by(models.PriceHistory.checked_at.desc(), models.PriceHistory.id.desc())
    )
    if limit is not None:
        query = query.limit(limit)
    return query.all()
