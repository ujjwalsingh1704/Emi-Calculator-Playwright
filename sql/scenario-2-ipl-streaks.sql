-- Treat every match in the 2024 dataset as a chance to extend or break a player's streak.
-- Missing player rows are treated as no appearance and therefore break the streak.
WITH season_matches AS (
  SELECT match_id, MIN(match_date) AS match_date
  FROM ipl_innings
  WHERE season = 2024
  GROUP BY match_id
), players AS (
  SELECT DISTINCT player_name
  FROM ipl_innings
  WHERE season = 2024
), player_match_grid AS (
  SELECT
    p.player_name,
    m.match_id,
    m.match_date,
    COALESCE(i.runs, 0) AS runs
  FROM players AS p
  CROSS JOIN season_matches AS m
  LEFT JOIN ipl_innings AS i
    ON i.player_name = p.player_name
   AND i.match_id = m.match_id
   AND i.season = 2024
), marked AS (
  SELECT
    *,
    SUM(CASE WHEN runs >= 30 THEN 0 ELSE 1 END) OVER (
      PARTITION BY player_name
      ORDER BY match_date, match_id
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS streak_group
  FROM player_match_grid
), streaks AS (
  SELECT
    player_name,
    MIN(match_date) AS streak_started,
    COUNT(*) AS qualifying_matches
  FROM marked
  WHERE runs >= 30
  GROUP BY player_name, streak_group
  HAVING COUNT(*) >= 3
)
SELECT player_name, streak_started, qualifying_matches
FROM streaks
ORDER BY player_name, streak_started;

