import express from "express";

import {
  confirmTeamsSchema,
  createMatchSchema,
  updateResultSchema,
  updateMatchStatusSchema,
} from "./admin.validation";
import { authMiddleware } from "../../middleware/auth.middlewares";
import { adminMiddleware } from "../../middleware/admin.middlewares";
import { validateRequest } from "../../middleware/validate.middleware";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", AdminController.getAdminStats);
router.get("/users", AdminController.getAllUsers);
router.get("/matches/:id/predictions", AdminController.getPredictionsForMatch);


router.post(
  "/matches",
  validateRequest(createMatchSchema),
  AdminController.createMatch,
);

router.patch(
  "/matches/:id/result",
  validateRequest(updateResultSchema),
  AdminController.updateResult,
);

router.patch(
  "/matches/:id/confirm-teams",
  validateRequest(confirmTeamsSchema),
  AdminController.confirmKnockoutTeams,
);

router.patch(
  "/matches/:id/status",
  validateRequest(updateMatchStatusSchema),
  AdminController.updateMatchStatus,
);

export const AdminRoutes = router;
