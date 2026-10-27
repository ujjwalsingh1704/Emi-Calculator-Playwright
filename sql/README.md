# A4 PostgreSQL submission

PostgreSQL is the authoritative database for A4. `schema.sql` creates the four tables and keys for both scenarios. `sample-data.sql` loads a small deterministic fixture for checking the query outputs; it is not a complete IPL season dataset.

## Tables and keys

| Table | Columns | Keys / constraints |
| --- | --- | --- |
| `transfers` | `transfer_id INTEGER`, `account_from TEXT`, `account_to TEXT`, `amount NUMERIC(12,2)`, `transferred_at TIMESTAMP` | PK `transfer_id`; positive amount; distinct source and destination |
| `ipl_matches` | `match_id INTEGER`, `match_date DATE`, `season INTEGER` | PK `match_id`; index `(season, match_date, match_id)` |
| `ipl_players` | `player_id INTEGER`, `player_name TEXT` | PK `player_id`; unique player name |
| `ipl_player_match_performance` | `match_id INTEGER`, `player_id INTEGER`, `runs INTEGER` | Composite PK `(match_id, player_id)`; FKs to matches and players; nonnegative runs |

## Run in PostgreSQL / pgAdmin

Create or select an empty database, open its Query Tool, then execute these files in order:

1. `schema.sql`
2. `sample-data.sql`
3. `scenario-1-round-trips.sql`
4. `scenario-2-ipl-streaks.sql`

The queries use PostgreSQL syntax. Scenario 1 returns the A→B and B→A transfer IDs 1 and 2 and both amounts when the reverse transfer occurs within 24 hours and is within 10% of the first amount. Scenario 2 finds runs of at least three consecutive 2024 team matches with 30+ runs. A missing performance row means the player did not appear and breaks that streak.

## Expected fixture results

- Scenario 1: A→B transfer 1 ($1,000) followed by B→A transfer 2 ($1,080), nine hours later.
- Scenario 2: Aarav Sharma, streak start `2024-04-01`, 3 qualifying matches.
- Gap Player has no qualifying streak because no performance record exists for match 11.

The five requested pgAdmin Query Tool captures are included under `../artifacts/a4-postgresql/`:

1. [Table schema](../artifacts/a4-postgresql/01-table-schema.jpg)
2. [Scenario 1 SQL](../artifacts/a4-postgresql/02-scenario-1-query.jpg)
3. [Scenario 1 output: IDs 1 and 2 with amounts](../artifacts/a4-postgresql/03-scenario-1-output.jpg)
4. [Scenario 2 SQL](../artifacts/a4-postgresql/04-scenario-2-query.jpg)
5. [Scenario 2 output: Aarav Sharma, 2024-04-01, 3 matches](../artifacts/a4-postgresql/05-scenario-2-output.jpg)

The fixture is intentionally compact; authoritative season results require the complete match schedule and player performance data.

`python sql/verify-sqlite.py` is a supplemental lightweight fixture check only. PostgreSQL/pgAdmin is the requested A4 evidence environment.
