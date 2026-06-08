export const MatchSQL = {
  getAllMatches: `
    SELECT *
    FROM matches
    ORDER BY kickoff_at ASC
  `,

  getTodayMatches: `
    SELECT *
    FROM matches
    WHERE match_date = (NOW() AT TIME ZONE 'Asia/Dhaka')::date
    ORDER BY match_time ASC
  `,

  getMatchesByDate: `
    SELECT *
    FROM matches
    WHERE match_date = $1
    ORDER BY match_time ASC
  `,

  getMatchById: `
    SELECT *
    FROM matches
    WHERE id = $1
  `,

  getUpcomingMatches: `
    SELECT *
    FROM matches
    WHERE status = 'upcoming'
    ORDER BY kickoff_at ASC
  `,
};
