INSERT INTO transfers (transfer_id, account_from, account_to, amount, transferred_at) VALUES
  (1, 'A', 'B', 1000.00, '2024-01-01 09:00:00'),
  (2, 'B', 'A', 1080.00, '2024-01-01 18:00:00'),
  (3, 'A', 'B', 500.00, '2024-01-02 09:00:00'),
  (4, 'B', 'A', 560.00, '2024-01-04 10:00:00');

INSERT INTO ipl_matches (match_id, match_date, season) VALUES
  (10, '2024-04-01', 2024),
  (11, '2024-04-03', 2024),
  (12, '2024-04-05', 2024),
  (13, '2024-04-07', 2024);

INSERT INTO ipl_players (player_id, player_name) VALUES
  (1, 'Aarav Sharma'),
  (2, 'Mira Patel'),
  (3, 'Gap Player');

INSERT INTO ipl_player_match_performance (match_id, player_id, runs) VALUES
  (10, 1, 38),
  (11, 1, 31),
  (12, 1, 45),
  (13, 1, 18),
  (10, 2, 44),
  (11, 2, 12),
  (12, 2, 52),
  (13, 2, 35),
  (10, 3, 40),
  -- Gap Player did not appear in match 11; these high scores must not form a 3-match streak.
  (12, 3, 42),
  (13, 3, 39);
