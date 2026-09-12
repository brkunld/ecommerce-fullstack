import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  description: z.string().min(5, "Aciklama en az 5 karakter olmalıdır"),
  price: z.number().positive("Fiyat 0'dan büyük olmalıdır"),
  stock: z
    .number()
    .int("Stok tam sayı olmalıdır")
    .min(0, "Stok miktarı 0'dan küçük olamaz"),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
