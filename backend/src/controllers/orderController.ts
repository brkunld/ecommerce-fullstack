import { type Response, type NextFunction } from "express";
import * as orderService from "../services/orderService.js";
import { type AuthRequest } from "../middleware/authMiddleware.js";

export const createOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const order = await orderService.createOrder(userId, req.body);
    res.status(201).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json({
      status: "success",
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ status: "success", data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const order = await orderService.getOrderById(id, userId, role);
    res.status(200).json({ status: "success", data: { order } });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, status);
    res.status(200).json({
      status: "success",
      message: "Sipariş durumu güncellendi",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
