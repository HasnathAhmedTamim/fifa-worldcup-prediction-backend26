import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { LeaderboardService } from "./leaderboard.service";

const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const leaderboard = await LeaderboardService.getLeaderboard(page, limit);

  res.status(200).json({
    success: true,
    message: "Leaderboard retrieved successfully",
    data: leaderboard,
  });
});

export const LeaderboardController = {
  getLeaderboard,
};
