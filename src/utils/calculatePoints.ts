type MatchResult = "TEAM_A_WIN" | "TEAM_B_WIN" | "DRAW";

type Prediction = {
  predicted_team_a_score: number;
  predicted_team_b_score: number;
  predicted_qualifier?: string | null;
};

type Match = {
  stage: "group" | "knockout";

  team_a: string;
  team_b: string;

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
      is_correct_winner: true,
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
    points: -1,
    is_exact_score: false,
    is_correct_winner: false,
    is_correct_qualifier: false,
  };
};

const calculateKnockoutPoints = (
  prediction: Prediction,
  match: Match,
): PointResult => {
  const exactScore =
    prediction.predicted_team_a_score === match.actual_team_a_score &&
    prediction.predicted_team_b_score === match.actual_team_b_score;

  const predictedResult = getMatchResult(
    prediction.predicted_team_a_score,
    prediction.predicted_team_b_score,
  );

  const actualResult = getMatchResult(
    match.actual_team_a_score,
    match.actual_team_b_score,
  );

  /**
   * ------------------------------------------
   * Normal win/loss after 90 minutes
   * ------------------------------------------
   */
  if (actualResult !== "DRAW") {
    if (exactScore) {
      return {
        points: 5,
        is_exact_score: true,
        is_correct_winner: true,
        is_correct_qualifier: false,
      };
    }

    if (predictedResult === actualResult) {
      return {
        points: 3,
        is_exact_score: false,
        is_correct_winner: true,
        is_correct_qualifier: false,
      };
    }

    return {
      points: -1,
      is_exact_score: false,
      is_correct_winner: false,
      is_correct_qualifier: false,
    };
  }

  /**
   * ------------------------------------------
   * Actual match ended DRAW
   * ------------------------------------------
   */

  // User also predicted DRAW
  if (predictedResult === "DRAW") {
    const correctQualifier =
      prediction.predicted_qualifier === match.actual_qualifier;

    if (!correctQualifier) {
      return {
        points: -1,
        is_exact_score: false,
        is_correct_winner: false,
        is_correct_qualifier: false,
      };
    }

    if (exactScore) {
      return {
        points: 5,
        is_exact_score: true,
        is_correct_winner: true,
        is_correct_qualifier: true,
      };
    }

    return {
      points: 3,
      is_exact_score: false,
      is_correct_winner: true,
      is_correct_qualifier: true,
    };
  }

  /**
   * ------------------------------------------
   * User predicted a winner
   * Example:
   *
   * Actual:
   * 1-1
   * Brazil qualifies
   *
   * Prediction:
   * 2-1 Brazil
   *
   * ==> 3 points
   * ------------------------------------------
   */

  const predictedWinner =
    predictedResult === "TEAM_A_WIN" ? match.team_a : match.team_b;

  if (predictedWinner === match.actual_qualifier) {
    return {
      points: 3,
      is_exact_score: false,
      is_correct_winner: true,
      is_correct_qualifier: true,
    };
  }

  return {
    points: -1,
    is_exact_score: false,
    is_correct_winner: false,
    is_correct_qualifier: false,
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
