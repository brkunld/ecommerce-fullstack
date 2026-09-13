import { type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

import * as cartService from "../services/cartService.js";
import { type AuthRequest } from "../middleware/authMiddleware.js";

export const getCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);
    if (!cart) {
      throw new AppError("Sepet bulunamadı", 404);
    }
    res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    const item = await cartService.addToCart(userId, productId, quantity);
    res.status(201).json({
      status: "success",
      message: "Ürün sepete eklendi",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await cartService.updateCartItem(userId, id, quantity);
    res.status(200).json({
      status: "success",
      message: "Sepet güncellendi",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const item = await cartService.removeFromCart(userId, id);
    res
      .status(200)
      .json({ status: "success", message: "Ürün sepetten kaldırıldı" });
  } catch (error) {
    next(error);
  }
};

export const clearCartController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    await cartService.clearCart(userId);
    res
      .status(200)
      .json({ status: "success", message: "Sepet başarıyla temizlendi" });
  } catch (error) {
    next(error);
  }
};
