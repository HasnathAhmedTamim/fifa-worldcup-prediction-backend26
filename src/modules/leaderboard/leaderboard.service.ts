import { pool } from "../../config/db";
import { LeaderboardSQL } from "./leaderboard.sql";

const getLeaderboard = async () => {
  const result = await pool.query(LeaderboardSQL.getLeaderboard);

  return result.rows.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
};

export const LeaderboardService = {
  getLeaderboard,
};
