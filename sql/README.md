# SQL assessment artifacts

`schema.sql` defines the minimal tables. Run `schema.sql`, then `sample-data.sql`, then both scenario queries in PostgreSQL. The transfer query uses PostgreSQL interval syntax. The IPL query treats consecutive `match_id` values in the supplied per-player data as consecutive team matches; gaps break a streak.

Run `python sql/verify-sqlite.py` to execute the fixture locally without installing a database server. It executes the IPL query unchanged and checks the SQLite equivalent of the PostgreSQL 24-hour interval predicate in Scenario 1.

Sample output: Scenario 1 returns transfer ids 1 and 2 (A->B $1,000, then B->A $1,080 within 9 hours and an 8% difference). Scenario 2 returns Aarav Sharma, streak start 2024-04-01, three matches. This is a compact fixture, not a full 2024 IPL dataset.
