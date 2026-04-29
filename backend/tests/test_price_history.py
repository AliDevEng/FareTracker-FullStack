from decimal import Decimal
from unittest.mock import MagicMock

import pytest

from app import models, schemas
from app.services import price_history


def test_price_history_create_schema_rejects_non_positive_price():
    with pytest.raises(ValueError, match="price must be greater than 0"):
        schemas.PriceHistoryCreate(
            flight_watch_id=1,
            price=Decimal("0"),
            currency="SEK",
        )


def test_create_for_watch_persists_history_row():
    db = MagicMock()

    history_row = price_history.create_for_watch(
        db,
        7,
        price=Decimal("1999.99"),
        currency="SEK",
        source_name="test-provider",
    )

    assert isinstance(history_row, models.PriceHistory)
    assert history_row.flight_watch_id == 7
    assert history_row.price == Decimal("1999.99")
    assert history_row.currency == "SEK"
    assert history_row.source_name == "test-provider"
    db.add.assert_called_once_with(history_row)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(history_row)


def test_get_for_watch_applies_default_ordering():
    db = MagicMock()
    query = db.query.return_value
    filtered_query = query.filter.return_value
    ordered_query = filtered_query.order_by.return_value
    ordered_query.all.return_value = ["history-row"]

    result = price_history.get_for_watch(db, 12)

    assert result == ["history-row"]
    db.query.assert_called_once_with(models.PriceHistory)
    query.filter.assert_called_once()
    filtered_query.order_by.assert_called_once()
    ordered_query.all.assert_called_once()


def test_get_for_watch_applies_limit_when_provided():
    db = MagicMock()
    query = db.query.return_value
    filtered_query = query.filter.return_value
    ordered_query = filtered_query.order_by.return_value
    limited_query = ordered_query.limit.return_value
    limited_query.all.return_value = ["limited-history-row"]

    result = price_history.get_for_watch(db, 12, limit=5)

    assert result == ["limited-history-row"]
    ordered_query.limit.assert_called_once_with(5)
    limited_query.all.assert_called_once()
