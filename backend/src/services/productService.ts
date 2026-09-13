import prisma from "../config/prisma.js";
import { slugify } from "../utils/slugify.js";

export interface ProductQueryParams {
  page?: number; // Varsayılan: 1
  limit?: number; // Varsayılan: 10
  search?: string; // İsimde veya açıklamada arama
  categoryId?: string; // Belirli bir kategorideki ürünler
  minPrice?: number; // Minimum fiyat
  maxPrice?: number; // Maksimum fiyat
  featured?: boolean; // Öne çıkan ürünler
  sortBy?: "price" | "createdAt" | "name"; // Sıralama alanı (varsayılan: createdAt)
  sortOrder?: "asc" | "desc"; // Artan / Azalan (varsayılan: desc)
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  slug?: string;
  images?: string[];
  featured?: boolean;
  isActive?: boolean;
}

export const createProduct = (data: CreateProductData) => {
  const slug = data.slug || slugify(data.name);
  return prisma.product.create({
    data: { ...data, slug },
    include: { category: true },
  });
};

export const getProductById = (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};

export const getProductBySlug = (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
};

export const updateProduct = (id: string, data: Partial<CreateProductData>) => {
  const updateData = { ...data };
  if (data.name && !data.slug) {
    updateData.slug = slugify(data.name);
  }
  return prisma.product.update({ where: { id }, data: updateData });
};

//soft delete
export const deleteProduct = (id: string) => {
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};

export const getAllProducts = async (params: ProductQueryParams = {}) => {
  let page = Number(params.page) || 1;
  let limit = Number(params.limit) || 10;
  let skip = (page - 1) * limit;
  let take = limit;
  const where: any = { isActive: true };
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) where.price.gte = Number(params.minPrice);
    if (params.maxPrice !== undefined) where.price.lte = Number(params.maxPrice);
  }
  if (params.featured !== undefined) {
    where.featured = String(params.featured) === "true";
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [params.sortBy || "createdAt"]: params.sortOrder || "desc" },
      include: { category: true },
    }),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
