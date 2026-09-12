import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  slug: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
