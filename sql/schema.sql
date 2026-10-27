CREATE TABLE transfers (
  transfer_id INTEGER PRIMARY KEY,
  account_from TEXT NOT NULL,
  account_to TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  transferred_at TIMESTAMP NOT NULL
);

CREATE TABLE ipl_innings (
  match_id INTEGER NOT NULL,
  match_date DATE NOT NULL,
  season INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  runs INTEGER NOT NULL CHECK (runs >= 0),
  PRIMARY KEY (match_id, player_name)
);
