export const AdminSQL = {
  createMatch: `
    INSERT INTO matches (
      match_no,
      team_a,
      team_b,
      team_a_placeholder,
      team_b_placeholder,
      match_date,
      match_time,
      kickoff_at,
      stage,
      round_name,
      group_name,
      venue,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
  `,

  getMatchById: `
    SELECT *
    FROM matches
    WHERE id = $1
  `,

  updateResult: `
    UPDATE matches
    SET
      actual_team_a_score = $1,
      actual_team_b_score = $2,
      actual_qualifier = $3,
      status = 'completed',
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
  `,

  getPredictionsByMatch: `
    SELECT *
    FROM predictions
    WHERE match_id = $1
  `,

  updatePredictionPoints: `
    UPDATE predictions
    SET
      points = $1,
      is_exact_score = $2,
      is_correct_winner = $3,
      is_correct_qualifier = $4,
      updated_at = NOW()
    WHERE id = $5
  `,

  recalculateUserStats: `
    UPDATE users u
    SET
      total_points = COALESCE(stats.total_points, 0),
      exact_scores = COALESCE(stats.exact_scores, 0),
      correct_winners = COALESCE(stats.correct_winners, 0),
      updated_at = NOW()
    FROM (
      SELECT
        user_id,
        SUM(points) AS total_points,
        COUNT(*) FILTER (WHERE is_exact_score = true) AS exact_scores,
        COUNT(*) FILTER (WHERE is_correct_winner = true) AS correct_winners
      FROM predictions
      GROUP BY user_id
    ) stats
    WHERE u.id = stats.user_id
  `,

  resetUsersWithNoPredictions: `
    UPDATE users
    SET
      total_points = 0,
      exact_scores = 0,
      correct_winners = 0,
      updated_at = NOW()
    WHERE role = 'user'
    AND id NOT IN (
      SELECT DISTINCT user_id FROM predictions
    )
  `,

  confirmKnockoutTeams: `
    UPDATE matches
    SET
      team_a = $1,
      team_b = $2,
      status = 'upcoming',
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `,
};
