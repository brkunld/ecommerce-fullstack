import { z } from "zod";

// Sepete ürün eklerken gelen veri
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Ürün ID'si zorunludur"),
  quantity: z
    .number()
    .int("Miktar tam sayı olmalıdır")
    .positive("Miktar 0'dan büyük olmalıdır")
    .default(1),
});

// Sepetteki ürünün miktarını güncellerken gelen veri
export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Miktar tam sayı olmalıdır")
    .positive("Miktar 0'dan büyük olmalıdır"),
});
