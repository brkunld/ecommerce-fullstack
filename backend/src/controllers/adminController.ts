// backend/src/controllers/adminController.ts
import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import * as adminService from "../services/adminService.js";

export const getDashboardStatsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await adminService.getDashboardStats();

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
