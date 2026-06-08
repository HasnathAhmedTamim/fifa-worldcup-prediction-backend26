import express from "express";

import {
  confirmTeamsSchema,
  createMatchSchema,
  updateResultSchema,
} from "./admin.validation";
import { authMiddleware } from "../../middleware/auth.middlewares";
import { adminMiddleware } from "../../middleware/admin.middlewares";
import { validateRequest } from "../../middleware/validate.middleware";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

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

export const AdminRoutes = router;
