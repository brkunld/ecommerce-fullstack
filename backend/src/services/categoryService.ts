import prisma from "../config/prisma.js";
import { slugify } from "../utils/slugify.js";

export const getAllCategories = () => {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
};

export const getCategoryById = (id: string) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

export interface CreateCategoryData {
  name: string;
  slug?: string;
  image?: string;
  description?: string;
}

export const createCategory = (data: CreateCategoryData) => {
  const slug = data.slug || slugify(data.name);
  return prisma.category.create({
    data: { ...data, slug },
  });
};

export const getCategoryBySlug = (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
  });
};

export const updateCategory = (
  id: string,
  data: Partial<CreateCategoryData>,
) => {
  const updateData = { ...data };
  if (data.name && !data.slug) {
    updateData.slug = slugify(data.name);
  }
  return prisma.category.update({ where: { id }, data: updateData });
};

export const deleteCategory = (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};
