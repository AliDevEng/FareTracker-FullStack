from typing import Optional

from sqlalchemy.orm import Session

from app import models, schemas


def get_all(db: Session) -> list[models.FlightWatch]:
    return db.query(models.FlightWatch).all()


def get_by_id(db: Session, watch_id: int) -> Optional[models.FlightWatch]:
    return db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()


def create(db: Session, payload: schemas.FlightWatchCreate) -> models.FlightWatch:
    watch = models.FlightWatch(**payload.model_dump())
    db.add(watch)
    db.commit()
    db.refresh(watch)
    return watch


def update(db: Session, watch_id: int, payload: schemas.FlightWatchUpdate) -> Optional[models.FlightWatch]:
    watch = get_by_id(db, watch_id)
    if not watch:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(watch, field, value)
    db.commit()
    db.refresh(watch)
    return watch


def delete(db: Session, watch_id: int) -> bool:
    watch = get_by_id(db, watch_id)
    if not watch:
        return False
    db.delete(watch)
    db.commit()
    return True
