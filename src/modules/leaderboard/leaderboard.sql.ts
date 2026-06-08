export const LeaderboardSQL = {
  getLeaderboard: `
  SELECT
    id,
    name,
    email,
    total_points,
    exact_scores,
    correct_winners,
    wrong_predictions,
    missed_predictions,
    champion_correct
  FROM users
  WHERE role = 'user'
  ORDER BY
    total_points DESC,
    exact_scores DESC,
    correct_winners DESC,
    wrong_predictions ASC,
    missed_predictions ASC,
    champion_correct DESC,
    name ASC
  LIMIT $1 OFFSET $2
`,

  countLeaderboardUsers: `
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = 'user'
  `,
};
