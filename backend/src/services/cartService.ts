import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { getProductById } from "./productService.js";

// Kullanıcının sepetini getirir; sepeti yoksa oluşturup döner
export const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
};

export const getCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true, // Ürünün fiyatını alabilmek için product tablosunu da bağlıyoruz
        },
      },
    },
  });
  if (!cart) return { cart: null, totalPrice: 0, itemCount: 0 };
  let itemCount = 0;
  let totalPrice = 0;
  cart.items.forEach((item) => {
    totalPrice += Number(item.product.price) * item.quantity;
    itemCount += item.quantity; // 1 yerine adedi kadar artmalı
  });

  return {
    cart,
    totalPrice,
    itemCount,
  };
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  let product = await getProductById(productId);
  if (!product || !product.isActive) {
    throw new AppError("Ürün bulunamadı veya satışta değil", 404);
  }
  const cart = await getOrCreateCart(userId);
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) throw new AppError("Yetersiz stok", 400);
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: { product: true },
    });
  }
  if (product.stock < quantity) throw new AppError("Yetersiz stok", 400);
  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
    include: { product: true },
  });
};

export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  quantity: number,
) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true, cart: true },
  });
  if (!cartItem) {
    throw new AppError("Sepet öğesi bulunamadı", 404);
  }
  if (userId != cartItem.cart.userId) {
    throw new AppError("Yetkiniz yok", 403);
  }
  if (quantity > cartItem.product.stock) {
    throw new AppError("Yetersiz stok", 400);
  }
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: quantity },
    include: { product: true, cart: true },
  });
};
export const removeFromCart = async (userId: string, cartItemId: string) => {
  const ShoppingCart = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!ShoppingCart) {
    throw new AppError("Sepet öğesi bulunamadı", 404);
  }
  if (ShoppingCart.cart.userId !== userId) {
    throw new AppError("Bu işlem için yetkiniz bulunmamaktadır", 403);
  }
  return prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw new AppError("Sepet bulunamadı", 404);
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return { message: "Sepet başarıyla temizlendi" };
};
