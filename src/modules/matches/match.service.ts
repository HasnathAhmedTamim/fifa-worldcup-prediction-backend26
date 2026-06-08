import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { MatchSQL } from "./match.sql";

const getAllMatches = async () => {
  const result = await pool.query(MatchSQL.getAllMatches);
  return result.rows;
};

const getTodayMatches = async () => {
  const result = await pool.query(MatchSQL.getTodayMatches);
  return result.rows;
};

const getMatchesByDate = async (date: string) => {
  if (!date) {
    throw new ApiError(400, "Date query is required");
  }

  const result = await pool.query(MatchSQL.getMatchesByDate, [date]);
  return result.rows;
};

const getMatchById = async (id: number) => {
  const result = await pool.query(MatchSQL.getMatchById, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, "Match not found");
  }

  return result.rows[0];
};

export const MatchService = {
  getAllMatches,
  getTodayMatches,
  getMatchesByDate,
  getMatchById,
};
