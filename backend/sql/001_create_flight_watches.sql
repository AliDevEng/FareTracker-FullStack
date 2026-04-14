CREATE TABLE IF NOT EXISTS flight_watches (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    origin          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    departure_date  DATE NOT NULL,
    return_date     DATE NULL,
    is_round_trip   BOOLEAN NOT NULL DEFAULT FALSE,
    target_price    NUMERIC(10,2) NOT NULL CHECK (target_price > 0),
    current_price   NUMERIC(10,2) NULL CHECK (current_price IS NULL OR current_price > 0),
    currency        VARCHAR(10) NOT NULL DEFAULT 'SEK',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_return_date CHECK (
        return_date IS NULL OR return_date >= departure_date
    )
);
