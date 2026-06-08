import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }

  next();
};
