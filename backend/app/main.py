from fastapi import FastAPI

from app.routes import watches

app = FastAPI(
    title="FareTracker API",
    description="Track flight prices and get notified when they drop.",
    version="0.1.0",
)

app.include_router(watches.router, prefix="/watches", tags=["watches"])


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok"}
