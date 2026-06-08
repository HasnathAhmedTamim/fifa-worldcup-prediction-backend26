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

  const updatedMatchResult = await pool.query(AdminSQL.updateResult, [
    payload.actual_team_a_score,
    payload.actual_team_b_score,
    payload.actual_qualifier || null,
    matchId,
  ]);

  const updatedMatch = updatedMatchResult.rows[0];

  const predictionsResult = await pool.query(AdminSQL.getPredictionsByMatch, [
    matchId,
  ]);

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

  await pool.query(AdminSQL.recalculateUserStats);
  await pool.query(AdminSQL.resetUsersWithNoPredictions);

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

export const AdminService = {
  createMatch,
  updateResult,
  confirmKnockoutTeams,
};
