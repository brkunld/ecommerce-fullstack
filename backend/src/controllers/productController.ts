import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

import * as productService from "../services/productService.js";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. URL query parametrelerini servise iletiyoruz
    const { products, pagination } = await productService.getAllProducts(
      req.query as any,
    );

    // 2. Hem ürünleri hem de sayfa bilgilerini dönüyoruz
    res.status(200).json({
      status: "success",
      data: {
        products,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      throw new AppError("Ürün bulunamadı", 404);
    }
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    if (!product) {
      throw new AppError("Ürün bulunamadı", 404);
    }
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Yeni oluşturulacak veri URL'den (req.params) değil, HTTP Body'sinden (req.body) gelir
    const product = await productService.createProduct(req.body);

    // 2. Yeni bir kaynak oluşturulduğunda HTTP 201 Created dönülür
    res.status(201).json({
      status: "success",
      message: "Ürün başarıyla oluşturuldu",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      throw new AppError("Ürün bulunamadı", 404);
    }
    const updated = await productService.updateProduct(id, req.body);

    res.status(200).json({
      status: "success",
      data: {
        product: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      throw new AppError("Urun bulunamadı", 404);
    }
    await productService.deleteProduct(id);
    res.status(200).json({
      status: "success",
      message: "Ürün başarıyla silindi",
    });
  } catch (error) {
    next(error);
  }
};
