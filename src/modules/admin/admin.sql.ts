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
  getPredictionsForMatchDetails: `
  SELECT
    p.id AS prediction_id,
    p.user_id,
    u.name AS user_name,
    u.email AS user_email,

    p.match_id,
    p.predicted_team_a_score,
    p.predicted_team_b_score,
    p.predicted_qualifier,

    p.points,
    p.is_exact_score,
    p.is_correct_winner,
    p.is_correct_qualifier,

    p.created_at AS predicted_at,
    p.updated_at AS prediction_updated_at,

    m.match_no,
    m.team_a,
    m.team_b,
    m.team_a_placeholder,
    m.team_b_placeholder,
    m.stage,
    m.round_name,
    m.group_name,
    m.status,
    m.match_date,
    m.match_time,
    m.venue,
    m.actual_team_a_score,
    m.actual_team_b_score,
    m.actual_qualifier
  FROM predictions p
  JOIN users u ON p.user_id = u.id
  JOIN matches m ON p.match_id = m.id
  WHERE p.match_id = $1
  ORDER BY p.created_at ASC
  LIMIT $2 OFFSET $3
`,

  countPredictionsForMatch: `
  SELECT COUNT(*) AS total
  FROM predictions
  WHERE match_id = $1
`,

  recalculateUserStats: `
  UPDATE users u
  SET
    total_points = COALESCE(stats.total_points, 0),
    exact_scores = COALESCE(stats.exact_scores, 0),
    correct_winners = COALESCE(stats.correct_winners, 0),
    wrong_predictions = COALESCE(stats.wrong_predictions, 0),
    updated_at = NOW()
  FROM (
    SELECT
      user_id,
      SUM(points) AS total_points,
      COUNT(*) FILTER (WHERE is_exact_score = true) AS exact_scores,
      COUNT(*) FILTER (WHERE is_correct_winner = true) AS correct_winners,
      COUNT(*) FILTER (
        WHERE points = -1
      ) AS wrong_predictions
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
    wrong_predictions = 0,
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
  getAdminStats: `
  SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
    (SELECT COUNT(*) FROM matches) AS total_matches,
    (SELECT COUNT(*) FROM predictions) AS total_predictions,
    (SELECT COUNT(*) FROM matches WHERE status = 'completed') AS completed_matches,
    (SELECT COUNT(*) FROM matches WHERE status = 'upcoming') AS upcoming_matches,
    (SELECT COUNT(*) FROM matches WHERE status = 'pending') AS pending_matches,
    (SELECT COUNT(*) FROM matches WHERE stage = 'knockout' AND status = 'pending') AS pending_knockout_matches
`,

  getAllUsers: `
  SELECT
    id,
    name,
    email,
    role,
    total_points,
    exact_scores,
    correct_winners,
    wrong_predictions,
    missed_predictions,
    champion_correct,
    created_at
  FROM users
  ORDER BY created_at DESC
  LIMIT $1 OFFSET $2
`,

  countAllUsers: `
  SELECT COUNT(*) AS total
  FROM users
`,
  updateMatchStatus: `
  UPDATE matches
  SET
    status = $1,
    updated_at = NOW()
  WHERE id = $2
  RETURNING *
`,
  insertMissedPredictionsForMatch: `
  INSERT INTO missed_predictions (user_id, match_id, points)
  SELECT
    u.id,
    $1,
    -1
  FROM users u
  WHERE u.role = 'user'
    AND NOT EXISTS (
      SELECT 1
      FROM predictions p
      WHERE p.user_id = u.id
        AND p.match_id = $1
    )
    AND NOT EXISTS (
      SELECT 1
      FROM missed_predictions mp
      WHERE mp.user_id = u.id
        AND mp.match_id = $1
    )
  ON CONFLICT (user_id, match_id) DO NOTHING
`,
  insertMissedPredictionsForCompletedMatchesByUser: `
  INSERT INTO missed_predictions (user_id, match_id, points)
  SELECT
    $1,
    m.id,
    -1
  FROM matches m
  WHERE m.status = 'completed'
    AND NOT EXISTS (
      SELECT 1
      FROM predictions p
      WHERE p.user_id = $1
        AND p.match_id = m.id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM missed_predictions mp
      WHERE mp.user_id = $1
        AND mp.match_id = m.id
    )
  ON CONFLICT (user_id, match_id) DO NOTHING
`,

  recalculateAllUserStats: `
UPDATE users u
SET
  total_points =
    COALESCE(prediction_stats.total_points, 0)
    +
    COALESCE(missed_stats.missed_points, 0),

  exact_scores = COALESCE(prediction_stats.exact_scores, 0),

  correct_winners = COALESCE(prediction_stats.correct_winners, 0),

  wrong_predictions = COALESCE(prediction_stats.wrong_predictions, 0),

  missed_predictions = COALESCE(missed_stats.missed_predictions, 0)

FROM users target_user

LEFT JOIN (
  SELECT
    user_id,

    SUM(points) AS total_points,

    COUNT(*) FILTER (
      WHERE is_exact_score = true
    ) AS exact_scores,

    COUNT(*) FILTER (
      WHERE
        (is_correct_winner = true OR is_correct_qualifier = true)
        AND is_exact_score = false
    ) AS correct_winners,

    COUNT(*) FILTER (
      WHERE points = -1
    ) AS wrong_predictions

  FROM predictions
  GROUP BY user_id
) prediction_stats
ON prediction_stats.user_id = target_user.id

LEFT JOIN (
  SELECT
    user_id,
    SUM(points) AS missed_points,
    COUNT(*) AS missed_predictions
  FROM missed_predictions
  GROUP BY user_id
) missed_stats
ON missed_stats.user_id = target_user.id

WHERE u.id = target_user.id
`,
};
