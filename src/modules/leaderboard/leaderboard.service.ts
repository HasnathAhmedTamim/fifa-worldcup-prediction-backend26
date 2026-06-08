import { pool } from "../../config/db";
import { LeaderboardSQL } from "./leaderboard.sql";

const getLeaderboard = async (page: number, limit: number) => {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const [leaderboardResult, countResult] = await Promise.all([
    pool.query(LeaderboardSQL.getLeaderboard, [safeLimit, offset]),
    pool.query(LeaderboardSQL.countLeaderboardUsers),
  ]);

  const total = Number(countResult.rows[0].total);
  const totalPages = Math.ceil(total / safeLimit);

  const players = leaderboardResult.rows.map((user, index) => ({
    rank: offset + index + 1,
    ...user,
  }));

  return {
    players,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
};

export const LeaderboardService = {
  getLeaderboard,
};
