"""Execute assessment query fixtures with Python's built-in SQLite engine."""
from pathlib import Path
import json
import sqlite3

ROOT = Path(__file__).parent
db = sqlite3.connect(":memory:")
db.executescript((ROOT / "schema.sql").read_text(encoding="utf-8"))
db.executescript((ROOT / "sample-data.sql").read_text(encoding="utf-8"))

# SQLite equivalent of scenario-1-round-trips.sql's PostgreSQL INTERVAL test.
round_trips = db.execute("""
SELECT ab.transfer_id, ba.transfer_id, ab.amount, ba.amount,
       ab.transferred_at, ba.transferred_at
FROM transfers AS ab
JOIN transfers AS ba
  ON ba.account_from = ab.account_to
 AND ba.account_to = ab.account_from
 AND ba.transfer_id <> ab.transfer_id
 AND datetime(ba.transferred_at) > datetime(ab.transferred_at)
 AND datetime(ba.transferred_at) <= datetime(ab.transferred_at, '+24 hours')
 AND ABS(ba.amount - ab.amount) <= ab.amount * 0.10
WHERE ab.account_from < ab.account_to
ORDER BY ab.transferred_at
""").fetchall()
streaks = db.execute((ROOT / "scenario-2-ipl-streaks.sql").read_text(encoding="utf-8")).fetchall()

assert len(round_trips) == 1 and round_trips[0][:2] == (1, 2), round_trips
assert streaks == [("Aarav Sharma", "2024-04-01", 3)], streaks
print(json.dumps({"scenario1_round_trips": round_trips, "scenario2_ipl_streaks": streaks}, indent=2))
