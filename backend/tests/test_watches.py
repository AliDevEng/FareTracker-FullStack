import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_PAYLOAD = {
    "origin": "TEST_ORG",
    "destination": "TEST_DST",
    "departure_date": "2026-11-01",
    "is_round_trip": False,
    "target_price": 1500.00,
    "currency": "SEK",
}


# ── helpers ───────────────────────────────────────────────────────────────────

def create_test_watch() -> int:
    r = client.post("/watches/", json=VALID_PAYLOAD)
    assert r.status_code == 201
    return r.json()["id"]


def delete_test_watch(watch_id: int):
    client.delete(f"/watches/{watch_id}")


# ── GET all ───────────────────────────────────────────────────────────────────

def test_get_all_watches_returns_200():
    r = client.get("/watches/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ── GET one ───────────────────────────────────────────────────────────────────

def test_get_watch_returns_correct_record():
    watch_id = create_test_watch()
    r = client.get(f"/watches/{watch_id}")
    assert r.status_code == 200
    assert r.json()["origin"] == "TEST_ORG"
    assert r.json()["destination"] == "TEST_DST"
    delete_test_watch(watch_id)


def test_get_watch_returns_404_for_missing():
    r = client.get("/watches/999999")
    assert r.status_code == 404
    assert r.json()["detail"] == "Watch not found"


# ── POST ──────────────────────────────────────────────────────────────────────

def test_create_watch_returns_201():
    r = client.post("/watches/", json=VALID_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["origin"] == "TEST_ORG"
    assert data["target_price"] == "1500.00"
    assert data["is_active"] is True
    delete_test_watch(data["id"])


def test_create_watch_rejects_negative_price():
    payload = {**VALID_PAYLOAD, "target_price": -100}
    r = client.post("/watches/", json=payload)
    assert r.status_code == 422


def test_create_watch_rejects_missing_origin():
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "origin"}
    r = client.post("/watches/", json=payload)
    assert r.status_code == 422


# ── PATCH ─────────────────────────────────────────────────────────────────────

def test_update_watch_changes_field():
    watch_id = create_test_watch()
    r = client.patch(f"/watches/{watch_id}", json={"target_price": 999.00})
    assert r.status_code == 200
    assert r.json()["target_price"] == "999.00"
    delete_test_watch(watch_id)


def test_update_watch_only_changes_sent_fields():
    watch_id = create_test_watch()
    r = client.patch(f"/watches/{watch_id}", json={"is_active": False})
    assert r.status_code == 200
    data = r.json()
    assert data["is_active"] is False
    assert data["origin"] == "TEST_ORG"   # untouched
    delete_test_watch(watch_id)


def test_update_watch_returns_404_for_missing():
    r = client.patch("/watches/999999", json={"target_price": 500})
    assert r.status_code == 404


# ── DELETE ────────────────────────────────────────────────────────────────────

def test_delete_watch_returns_204():
    watch_id = create_test_watch()
    r = client.delete(f"/watches/{watch_id}")
    assert r.status_code == 204


def test_delete_watch_removes_record():
    watch_id = create_test_watch()
    client.delete(f"/watches/{watch_id}")
    r = client.get(f"/watches/{watch_id}")
    assert r.status_code == 404


def test_delete_watch_returns_404_for_missing():
    r = client.delete("/watches/999999")
    assert r.status_code == 404
