import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorMiddleware = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || null,
  });
};
