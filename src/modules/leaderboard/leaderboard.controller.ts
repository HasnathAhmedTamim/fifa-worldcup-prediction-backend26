import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { LeaderboardService } from "./leaderboard.service";

const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const leaderboard = await LeaderboardService.getLeaderboard();

  res.status(200).json({
    success: true,
    message: "Leaderboard retrieved successfully",
    data: leaderboard,
  });
});

export const LeaderboardController = {
  getLeaderboard,
};
