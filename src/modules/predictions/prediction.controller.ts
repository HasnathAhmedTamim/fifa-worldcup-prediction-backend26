import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PredictionService } from "./prediction.service";

const submitPrediction = asyncHandler(async (req: Request, res: Response) => {
  const prediction = await PredictionService.submitPrediction(
    req.user!.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Prediction submitted successfully",
    data: prediction,
  });
});

const getMyPredictions = asyncHandler(async (req: Request, res: Response) => {
  const predictions = await PredictionService.getMyPredictions(req.user!.id);

  res.status(200).json({
    success: true,
    message: "My predictions retrieved successfully",
    data: predictions,
  });
});

export const PredictionController = {
  submitPrediction,
  getMyPredictions,
};
