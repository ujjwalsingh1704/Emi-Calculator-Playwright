# SQL assessment artifacts

`schema.sql` defines the minimal tables. Run `schema.sql`, then `sample-data.sql`, then both scenario queries in PostgreSQL. The transfer query uses PostgreSQL interval syntax. The IPL query builds a player-by-match grid from every 2024 match present in the dataset; a missing player row or a score below 30 breaks the streak. `match_date` and `match_id` order the matches, with match ID as a tie-breaker.

Run `python sql/verify-sqlite.py` to execute the fixture locally without installing a database server. It executes the IPL query unchanged and checks the SQLite equivalent of the PostgreSQL 24-hour interval predicate in Scenario 1.

Sample output: Scenario 1 returns transfer ids 1 and 2 (A->B $1,000, then B->A $1,080 within 9 hours and an 8% difference). Scenario 2 returns Aarav Sharma, streak start 2024-04-01, three matches. The fixture also verifies that Gap Player, who is absent from match 11, is not incorrectly counted across that gap. This is a compact fixture, not a full 2024 IPL dataset; complete results depend on a complete season schedule and player-match rows, including zero-run appearances.

