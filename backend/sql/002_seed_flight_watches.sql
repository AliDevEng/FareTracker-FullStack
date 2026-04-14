INSERT INTO flight_watches
    (origin, destination, departure_date, return_date, is_round_trip, target_price, current_price, currency, is_active)
VALUES
    ('CPH', 'BCN', '2026-07-10', '2026-07-17', TRUE,  1800.00, 2200.00, 'SEK', TRUE),
    ('MMX', 'LHR', '2026-08-03', NULL,          FALSE,  950.00, NULL,    'SEK', TRUE),
    ('ARN', 'FCO', '2026-09-12', '2026-09-18', TRUE,  2100.00, 2450.00, 'SEK', FALSE);
