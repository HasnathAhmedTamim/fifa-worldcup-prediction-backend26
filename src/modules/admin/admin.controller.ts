import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminService } from "./admin.service";

const createMatch = asyncHandler(async (req: Request, res: Response) => {
  const match = await AdminService.createMatch(req.body);

  res.status(201).json({
    success: true,
    message: "Match created successfully",
    data: match,
  });
});

const updateResult = asyncHandler(async (req: Request, res: Response) => {
  const match = await AdminService.updateResult(
    Number(req.params.id),
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Result updated and points calculated successfully",
    data: match,
  });
});

const confirmKnockoutTeams = asyncHandler(
  async (req: Request, res: Response) => {
    const match = await AdminService.confirmKnockoutTeams(
      Number(req.params.id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Knockout teams confirmed successfully",
      data: match,
    });
  },
);

const getPredictionsForMatch = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AdminService.getPredictionsForMatch(
      Number(req.params.id),
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "Match predictions retrieved successfully",
      data: result,
    });
  },
);

const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await AdminService.getAdminStats();

  res.status(200).json({
    success: true,
    message: "Admin stats retrieved successfully",
    data: stats,
  });
});

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await AdminService.getAllUsers(page, limit);

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateMatchStatus = asyncHandler(async (req: Request, res: Response) => {
  const match = await AdminService.updateMatchStatus(
    Number(req.params.id),
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Match status updated successfully",
    data: match,
  });
});

export const AdminController = {
  createMatch,
  updateResult,
  confirmKnockoutTeams,
  getPredictionsForMatch,
  getAdminStats,
  getAllUsers,
  updateMatchStatus,
};
