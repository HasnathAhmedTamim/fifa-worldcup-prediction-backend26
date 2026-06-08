import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { PredictionSQL } from "./prediction.sql";

type PredictionPayload = {
  match_id: number;
  predicted_team_a_score: number;
  predicted_team_b_score: number;
  predicted_qualifier?: string;
};

const isMatchStarted = (kickoffAt: string | Date) => {
  return new Date(kickoffAt).getTime() <= Date.now();
};

const validatePredictionPermission = (
  match: any,
  payload: PredictionPayload,
) => {
  if (!match.team_a || !match.team_b) {
    throw new ApiError(400, "Teams are not confirmed yet");
  }

  if (match.status !== "upcoming") {
    throw new ApiError(400, "Prediction is not open for this match");
  }

  if (isMatchStarted(match.kickoff_at)) {
    throw new ApiError(400, "Prediction time is over");
  }

  if (match.stage === "knockout" && !payload.predicted_qualifier) {
    throw new ApiError(400, "Qualifier is required for knockout match");
  }

  if (
    match.stage === "knockout" &&
    payload.predicted_qualifier !== match.team_a &&
    payload.predicted_qualifier !== match.team_b
  ) {
    throw new ApiError(400, "Invalid qualifier selected");
  }
};

const submitPrediction = async (userId: number, payload: PredictionPayload) => {
  const matchResult = await pool.query(PredictionSQL.findMatchById, [
    payload.match_id,
  ]);

  if (matchResult.rows.length === 0) {
    throw new ApiError(404, "Match not found");
  }

  const match = matchResult.rows[0];

  validatePredictionPermission(match, payload);

  const existingPrediction = await pool.query(
    PredictionSQL.findPredictionByUserAndMatch,
    [userId, payload.match_id],
  );

  // If already predicted, update it before kickoff
  if (existingPrediction.rows.length > 0) {
    const updatedPrediction = await pool.query(
      PredictionSQL.updatePredictionByUserAndMatch,
      [
        payload.predicted_team_a_score,
        payload.predicted_team_b_score,
        payload.predicted_qualifier || null,
        userId,
        payload.match_id,
      ],
    );

    return updatedPrediction.rows[0];
  }

  const createdPrediction = await pool.query(PredictionSQL.createPrediction, [
    userId,
    payload.match_id,
    payload.predicted_team_a_score,
    payload.predicted_team_b_score,
    payload.predicted_qualifier || null,
  ]);

  return createdPrediction.rows[0];
};

const getMyPredictions = async (userId: number) => {
  const result = await pool.query(PredictionSQL.getMyPredictions, [userId]);
  return result.rows;
};

export const PredictionService = {
  submitPrediction,
  getMyPredictions,
};
