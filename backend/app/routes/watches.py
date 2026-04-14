from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.dependencies import get_db

router = APIRouter()


@router.post("/", response_model=schemas.FlightWatchResponse, status_code=status.HTTP_201_CREATED)
def create_watch(payload: schemas.FlightWatchCreate, db: Session = Depends(get_db)):
    watch = models.FlightWatch(**payload.model_dump())
    db.add(watch)
    db.commit()
    db.refresh(watch)
    return watch


@router.get("/", response_model=List[schemas.FlightWatchResponse])
def get_watches(db: Session = Depends(get_db)):
    return db.query(models.FlightWatch).all()


@router.get("/{watch_id}", response_model=schemas.FlightWatchResponse)
def get_watch(watch_id: int, db: Session = Depends(get_db)):
    watch = db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch not found")
    return watch


@router.patch("/{watch_id}", response_model=schemas.FlightWatchResponse)
def update_watch(watch_id: int, payload: schemas.FlightWatchUpdate, db: Session = Depends(get_db)):
    watch = db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(watch, field, value)
    db.commit()
    db.refresh(watch)
    return watch


@router.delete("/{watch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_watch(watch_id: int, db: Session = Depends(get_db)):
    watch = db.query(models.FlightWatch).filter(models.FlightWatch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch not found")
    db.delete(watch)
    db.commit()
