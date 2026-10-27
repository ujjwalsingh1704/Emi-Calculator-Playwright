-- Scenario 1: transfers that move similar amounts between two accounts in 24 hours.
CREATE TABLE transfers (
  transfer_id INTEGER PRIMARY KEY,
  account_from TEXT NOT NULL,
  account_to TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  transferred_at TIMESTAMP NOT NULL,
  CHECK (account_from <> account_to)
);

-- Scenario 2: normalized IPL-style match, player, and performance tables.
CREATE TABLE ipl_matches (
  match_id INTEGER PRIMARY KEY,
  match_date DATE NOT NULL,
  season INTEGER NOT NULL
);

CREATE TABLE ipl_players (
  player_id INTEGER PRIMARY KEY,
  player_name TEXT NOT NULL UNIQUE
);

CREATE TABLE ipl_player_match_performance (
  match_id INTEGER NOT NULL REFERENCES ipl_matches(match_id),
  player_id INTEGER NOT NULL REFERENCES ipl_players(player_id),
  runs INTEGER NOT NULL CHECK (runs >= 0),
  PRIMARY KEY (match_id, player_id)
);

CREATE INDEX ipl_matches_season_date_idx
  ON ipl_matches (season, match_date, match_id);
