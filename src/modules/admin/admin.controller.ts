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

export const AdminController = {
  createMatch,
  updateResult,
  confirmKnockoutTeams,
};
