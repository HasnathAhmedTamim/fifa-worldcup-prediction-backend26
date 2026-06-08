import express from "express";
import { AuthController } from "./auth.controller";

import { loginSchema, registerSchema } from "./auth.validation";
import { validateRequest } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middlewares";


const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register,
);

router.post("/login", validateRequest(loginSchema), AuthController.login);

router.get("/me", authMiddleware, AuthController.getMe);

export const AuthRoutes = router;
