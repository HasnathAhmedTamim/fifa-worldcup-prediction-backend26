import express from "express";
import { PredictionController } from "./prediction.controller";

import { submitPredictionSchema } from "./prediction.validation";
import { authMiddleware } from "../../middleware/auth.middlewares";
import { validateRequest } from "../../middleware/validate.middleware";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(submitPredictionSchema),
  PredictionController.submitPrediction,
);

router.get("/my", authMiddleware, PredictionController.getMyPredictions);

export const PredictionRoutes = router;
