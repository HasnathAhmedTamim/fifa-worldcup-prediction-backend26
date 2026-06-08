import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthService } from "./auth.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.getMe(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: user,
  });
});

export const AuthController = {
  register,
  login,
  getMe,
};
