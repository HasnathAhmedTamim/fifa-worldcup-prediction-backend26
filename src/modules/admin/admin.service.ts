import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { calculatePoints } from "../../utils/calculatePoints";
import { AdminSQL } from "./admin.sql";

type CreateMatchPayload = {
  match_no?: number;
  team_a?: string;
  team_b?: string;
  team_a_placeholder?: string;
  team_b_placeholder?: string;
  match_date: string;
  match_time: string;
  kickoff_at: string;
  stage: "group" | "knockout";
  round_name?: string;
  group_name?: string;
  venue?: string;
  status?: string;
};

type UpdateResultPayload = {
  actual_team_a_score: number;
  actual_team_b_score: number;
  actual_qualifier?: string;
};

type ConfirmTeamsPayload = {
  team_a: string;
  team_b: string;
};

type UpdateMatchStatusPayload = {
  status: "pending" | "upcoming" | "live" | "completed" | "cancelled";
};

const createMatch = async (payload: CreateMatchPayload) => {
  const result = await pool.query(AdminSQL.createMatch, [
    payload.match_no || null,
    payload.team_a || null,
    payload.team_b || null,
    payload.team_a_placeholder || null,
    payload.team_b_placeholder || null,
    payload.match_date,
    payload.match_time,
    payload.kickoff_at,
    payload.stage,
    payload.round_name || null,
    payload.group_name || null,
    payload.venue || null,
    payload.status || "upcoming",
  ]);

  return result.rows[0];
};

const updateResult = async (matchId: number, payload: UpdateResultPayload) => {
  const matchResult = await pool.query(AdminSQL.getMatchById, [matchId]);

  if (matchResult.rows.length === 0) {
    throw new ApiError(404, "Match not found");
  }

  const matchBeforeUpdate = matchResult.rows[0];

  if (matchBeforeUpdate.stage === "knockout" && !payload.actual_qualifier) {
    throw new ApiError(400, "Actual qualifier is required for knockout match");
  }

  if (
    matchBeforeUpdate.stage === "knockout" &&
    payload.actual_qualifier !== matchBeforeUpdate.team_a &&
    payload.actual_qualifier !== matchBeforeUpdate.team_b
  ) {
    throw new ApiError(400, "Invalid actual qualifier");
  }

  // 1. Update actual match result
  const updatedMatchResult = await pool.query(AdminSQL.updateResult, [
    payload.actual_team_a_score,
    payload.actual_team_b_score,
    payload.actual_qualifier || null,
    matchId,
  ]);

  const updatedMatch = updatedMatchResult.rows[0];

  // 2. Get all users who submitted prediction for this match
  const predictionsResult = await pool.query(AdminSQL.getPredictionsByMatch, [
    matchId,
  ]);

  // 3. Calculate points for submitted predictions
  for (const prediction of predictionsResult.rows) {
    const pointResult = calculatePoints(prediction, updatedMatch);

    await pool.query(AdminSQL.updatePredictionPoints, [
      pointResult.points,
      pointResult.is_exact_score,
      pointResult.is_correct_winner,
      pointResult.is_correct_qualifier,
      prediction.id,
    ]);
  }

  // 4. Give -1 to users who did not predict this match
  await pool.query(AdminSQL.insertMissedPredictionsForMatch, [matchId]);

  // 5. Recalculate leaderboard/user stats including missed penalties
  await pool.query(AdminSQL.recalculateAllUserStats);

  return updatedMatch;
};

const confirmKnockoutTeams = async (
  matchId: number,
  payload: ConfirmTeamsPayload,
) => {
  const matchResult = await pool.query(AdminSQL.getMatchById, [matchId]);

  if (matchResult.rows.length === 0) {
    throw new ApiError(404, "Match not found");
  }

  const match = matchResult.rows[0];

  if (match.stage !== "knockout") {
    throw new ApiError(400, "Only knockout match teams can be confirmed");
  }

  const result = await pool.query(AdminSQL.confirmKnockoutTeams, [
    payload.team_a,
    payload.team_b,
    matchId,
  ]);

  return result.rows[0];
};

const getPredictionsForMatch = async (
  matchId: number,
  page: number,
  limit: number,
) => {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const matchResult = await pool.query(AdminSQL.getMatchById, [matchId]);

  if (matchResult.rows.length === 0) {
    throw new ApiError(404, "Match not found");
  }

  const [predictionsResult, countResult] = await Promise.all([
    pool.query(AdminSQL.getPredictionsForMatchDetails, [
      matchId,
      safeLimit,
      offset,
    ]),
    pool.query(AdminSQL.countPredictionsForMatch, [matchId]),
  ]);

  const total = Number(countResult.rows[0].total);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const match = matchResult.rows[0];

  return {
    match,
    total_predictions: total,
    predictions: predictionsResult.rows,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
};

const getAdminStats = async () => {
  const result = await pool.query(AdminSQL.getAdminStats);

  const stats = result.rows[0];

  return {
    total_users: Number(stats.total_users),
    total_matches: Number(stats.total_matches),
    total_predictions: Number(stats.total_predictions),
    completed_matches: Number(stats.completed_matches),
    upcoming_matches: Number(stats.upcoming_matches),
    pending_matches: Number(stats.pending_matches),
    pending_knockout_matches: Number(stats.pending_knockout_matches),
  };
};

const getAllUsers = async (page: number, limit: number) => {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const [usersResult, countResult] = await Promise.all([
    pool.query(AdminSQL.getAllUsers, [safeLimit, offset]),
    pool.query(AdminSQL.countAllUsers),
  ]);

  const total = Number(countResult.rows[0].total);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    users: usersResult.rows,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
};

const updateMatchStatus = async (
  matchId: number,
  payload: UpdateMatchStatusPayload,
) => {
  const matchResult = await pool.query(AdminSQL.getMatchById, [matchId]);

  if (matchResult.rows.length === 0) {
    throw new ApiError(404, "Match not found");
  }

  const match = matchResult.rows[0];

  if (payload.status === "upcoming" && (!match.team_a || !match.team_b)) {
    throw new ApiError(
      400,
      "Cannot set match as upcoming before teams are confirmed",
    );
  }

  const result = await pool.query(AdminSQL.updateMatchStatus, [
    payload.status,
    matchId,
  ]);

  return result.rows[0];
};

export const AdminService = {
  createMatch,
  updateResult,
  confirmKnockoutTeams,
  getPredictionsForMatch,
  getAdminStats,
  getAllUsers,
  updateMatchStatus,
};
