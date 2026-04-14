from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.dependencies import get_db
from app.services import watches as watch_service

router = APIRouter()


@router.post("/", response_model=schemas.FlightWatchResponse, status_code=status.HTTP_201_CREATED)
def create_watch(payload: schemas.FlightWatchCreate, db: Session = Depends(get_db)):
    return watch_service.create(db, payload)


@router.get("/", response_model=List[schemas.FlightWatchResponse])
def get_watches(db: Session = Depends(get_db)):
    return watch_service.get_all(db)


@router.get("/{watch_id}", response_model=schemas.FlightWatchResponse)
def get_watch(watch_id: int, db: Session = Depends(get_db)):
    watch = watch_service.get_by_id(db, watch_id)
    if not watch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch not found")
    return watch


@router.patch("/{watch_id}", response_model=schemas.FlightWatchResponse)
def update_watch(watch_id: int, payload: schemas.FlightWatchUpdate, db: Session = Depends(get_db)):
    watch = watch_service.update(db, watch_id, payload)
    if not watch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch not found")
    return watch


@router.delete("/{watch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_watch(watch_id: int, db: Session = Depends(get_db)):
    if not watch_service.delete(db, watch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watch not found")
