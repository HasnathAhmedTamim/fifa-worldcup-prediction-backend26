import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { MatchService } from "./match.service";

const getAllMatches = asyncHandler(async (req: Request, res: Response) => {
  const matches = await MatchService.getAllMatches();

  res.status(200).json({
    success: true,
    message: "Matches retrieved successfully",
    data: matches,
  });
});

const getTodayMatches = asyncHandler(async (req: Request, res: Response) => {
  const matches = await MatchService.getTodayMatches();

  res.status(200).json({
    success: true,
    message: "Today's matches retrieved successfully",
    data: matches,
  });
});

const getMatchesByDate = asyncHandler(async (req: Request, res: Response) => {
  const matches = await MatchService.getMatchesByDate(req.query.date as string);

  res.status(200).json({
    success: true,
    message: "Matches retrieved by date successfully",
    data: matches,
  });
});

const getMatchById = asyncHandler(async (req: Request, res: Response) => {
  const match = await MatchService.getMatchById(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: "Match retrieved successfully",
    data: match,
  });
});

export const MatchController = {
  getAllMatches,
  getTodayMatches,
  getMatchesByDate,
  getMatchById,
};
