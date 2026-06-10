export const PredictionSQL = {
  findMatchById: `
    SELECT *
    FROM matches
    WHERE id = $1
  `,

  findPredictionByUserAndMatch: `
    SELECT *
    FROM predictions
    WHERE user_id = $1 AND match_id = $2
  `,

  createPrediction: `
    INSERT INTO predictions (
      user_id,
      match_id,
      predicted_team_a_score,
      predicted_team_b_score,
      predicted_qualifier
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,

  updatePredictionByUserAndMatch: `
    UPDATE predictions
    SET
      predicted_team_a_score = $1,
      predicted_team_b_score = $2,
      predicted_qualifier = $3,
      updated_at = NOW()
    WHERE user_id = $4 AND match_id = $5
    RETURNING *
  `,

  getMyPredictions: `
    SELECT
      p.*,
      m.match_no,
      m.team_a,
      m.team_b,
      m.team_a_placeholder,
      m.team_b_placeholder,
      m.match_date,
      m.match_time,
      m.kickoff_at,
      m.stage,
      m.round_name,
      m.group_name,
      m.venue,
      m.status,
      m.actual_team_a_score,
      m.actual_team_b_score,
      m.actual_qualifier
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = $1
    ORDER BY m.kickoff_at ASC
  `,

  findCurrentTickerMatch: `
    SELECT
      id,
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
    FROM matches
    WHERE status NOT IN ('completed', 'cancelled')
    ORDER BY match_no ASC
    LIMIT 1
  `,

  getPredictionTickerByMatchId: `
    SELECT
      u.name AS user_name,
      p.predicted_team_a_score,
      p.predicted_team_b_score,
      p.predicted_qualifier,
      p.created_at,
      p.updated_at
    FROM predictions p
    JOIN users u ON p.user_id = u.id
    WHERE p.match_id = $1
    ORDER BY p.updated_at DESC, p.created_at DESC
  `,
};
