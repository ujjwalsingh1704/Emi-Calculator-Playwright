INSERT INTO transfers VALUES
  (1, 'A', 'B', 1000.00, '2024-01-01 09:00:00'),
  (2, 'B', 'A', 1080.00, '2024-01-01 18:00:00'),
  (3, 'A', 'B', 500.00, '2024-01-02 09:00:00'),
  (4, 'B', 'A', 560.00, '2024-01-04 10:00:00');

INSERT INTO ipl_innings VALUES
  (10, '2024-04-01', 2024, 'Aarav Sharma', 38),
  (11, '2024-04-03', 2024, 'Aarav Sharma', 31),
  (12, '2024-04-05', 2024, 'Aarav Sharma', 45),
  (13, '2024-04-07', 2024, 'Aarav Sharma', 18),
  (10, '2024-04-01', 2024, 'Mira Patel', 44),
  (11, '2024-04-03', 2024, 'Mira Patel', 12),
  (12, '2024-04-05', 2024, 'Mira Patel', 52),
  (13, '2024-04-07', 2024, 'Mira Patel', 35);

-- Gap Player scores 30+ in matches 10, 12 and 13, but did not appear in match 11.
-- The missing team match must break a three-match streak.
INSERT INTO ipl_innings VALUES
  (10, '2024-04-01', 2024, 'Gap Player', 40),
  (12, '2024-04-05', 2024, 'Gap Player', 42),
  (13, '2024-04-07', 2024, 'Gap Player', 39);

