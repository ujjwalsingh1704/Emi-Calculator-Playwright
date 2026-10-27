-- Consecutive match ids represent consecutive matches for each player.
WITH qualifying AS (
  SELECT * FROM ipl_innings WHERE season = 2024 AND runs >= 30
), numbered AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY player_name ORDER BY match_id) AS rn
  FROM qualifying
), islands AS (
  SELECT *, match_id - rn AS streak_group FROM numbered
), streaks AS (
  SELECT player_name, MIN(match_date) AS streak_started, COUNT(*) AS qualifying_matches
  FROM islands
  GROUP BY player_name, streak_group
  HAVING COUNT(*) >= 3
)
SELECT player_name, streak_started, qualifying_matches
FROM streaks
ORDER BY player_name, streak_started;
