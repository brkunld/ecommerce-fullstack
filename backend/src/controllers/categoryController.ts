import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

import * as categoryService from "../services/categoryService.js";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      throw new AppError("Kategori bulunamadı", 404);
    }
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) {
      throw new AppError("Kategori bulunamadı", 404);
    }
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Yeni oluşturulacak veri URL'den (req.params) değil, HTTP Body'sinden (req.body) gelir
    const category = await categoryService.createCategory(req.body);

    // 2. Yeni bir kaynak oluşturulduğunda HTTP 201 Created dönülür
    res.status(201).json({
      status: "success",
      message: "Kategori başarıyla oluşturuldu",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      throw new AppError("Kategori bulunamadı", 404);
    }
    const updated = await categoryService.updateCategory(id, req.body);

    res.status(200).json({
      status: "success",
      data: {
        category: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      throw new AppError("Kategori bulunamadı", 404);
    }
    await categoryService.deleteCategory(id);
    res.status(200).json({
      status: "success",
      message: "Kategori başarıyla silindi",
    });
  } catch (error) {
    next(error);
  }
};
