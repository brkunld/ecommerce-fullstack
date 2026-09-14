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

export const getAllUsersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Kullanıcı bulunamadı",
      });
    }
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user?.id;

    const updatedUser = await adminService.updateUserRole(id, role, currentAdminId);

    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
