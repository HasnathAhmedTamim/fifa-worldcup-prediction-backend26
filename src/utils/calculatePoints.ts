type MatchResult = "TEAM_A_WIN" | "TEAM_B_WIN" | "DRAW";

type Prediction = {
  predicted_team_a_score: number;
  predicted_team_b_score: number;
  predicted_qualifier?: string | null;
};

type Match = {
  stage: "group" | "knockout";
  actual_team_a_score: number;
  actual_team_b_score: number;
  actual_qualifier?: string | null;
};

export type PointResult = {
  points: number;
  is_exact_score: boolean;
  is_correct_winner: boolean;
  is_correct_qualifier: boolean;
};

const getMatchResult = (
  teamAScore: number,
  teamBScore: number,
): MatchResult => {
  if (teamAScore > teamBScore) return "TEAM_A_WIN";
  if (teamBScore > teamAScore) return "TEAM_B_WIN";
  return "DRAW";
};

const calculateGroupPoints = (
  prediction: Prediction,
  match: Match,
): PointResult => {
  const exactScore =
    prediction.predicted_team_a_score === match.actual_team_a_score &&
    prediction.predicted_team_b_score === match.actual_team_b_score;

  if (exactScore) {
    return {
      points: 5,
      is_exact_score: true,
      is_correct_winner: false,
      is_correct_qualifier: false,
    };
  }

  const predictedResult = getMatchResult(
    prediction.predicted_team_a_score,
    prediction.predicted_team_b_score,
  );

  const actualResult = getMatchResult(
    match.actual_team_a_score,
    match.actual_team_b_score,
  );

  if (predictedResult === actualResult) {
    return {
      points: 3,
      is_exact_score: false,
      is_correct_winner: true,
      is_correct_qualifier: false,
    };
  }

  return {
    points: 0,
    is_exact_score: false,
    is_correct_winner: false,
    is_correct_qualifier: false,
  };
};

const calculateKnockoutPoints = (
  prediction: Prediction,
  match: Match,
): PointResult => {
  let points = 0;

  const exactScore =
    prediction.predicted_team_a_score === match.actual_team_a_score &&
    prediction.predicted_team_b_score === match.actual_team_b_score;

  const correctQualifier =
    Boolean(prediction.predicted_qualifier) &&
    Boolean(match.actual_qualifier) &&
    prediction.predicted_qualifier === match.actual_qualifier;

  if (exactScore) {
    points += 5;
  }

  if (correctQualifier) {
    points += 3;
  }

  return {
    points,
    is_exact_score: exactScore,
    is_correct_winner: false,
    is_correct_qualifier: correctQualifier,
  };
};

export const calculatePoints = (
  prediction: Prediction,
  match: Match,
): PointResult => {
  if (match.stage === "knockout") {
    return calculateKnockoutPoints(prediction, match);
  }

  return calculateGroupPoints(prediction, match);
};
