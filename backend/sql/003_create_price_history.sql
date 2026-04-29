CREATE TABLE IF NOT EXISTS price_history (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    flight_watch_id  INTEGER NOT NULL REFERENCES flight_watches(id) ON DELETE CASCADE,
    price            NUMERIC(10,2) NOT NULL CHECK (price > 0),
    currency         VARCHAR(10) NOT NULL,
    checked_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_name      VARCHAR(100) NULL
);

CREATE INDEX IF NOT EXISTS idx_price_history_watch_checked_at
    ON price_history (flight_watch_id, checked_at DESC);
