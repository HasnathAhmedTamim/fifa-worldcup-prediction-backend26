export const LeaderboardSQL = {
  getLeaderboard: `
    SELECT
      id,
      name,
      email,
      total_points,
      exact_scores,
      correct_winners,
      champion_correct
    FROM users
    WHERE role = 'user'
    ORDER BY
      total_points DESC,
      exact_scores DESC,
      correct_winners DESC,
      champion_correct DESC,
      name ASC
  `,
};
