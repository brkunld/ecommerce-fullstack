import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z
    .string()
    .min(10, "Teslimat adresi en az 10 karakter olmalıdır"),
  contactPhone: z
    .string()
    .min(10, "Telefon numarasi en az 10 karakter olmalıdır")
    .optional(),

  note: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
