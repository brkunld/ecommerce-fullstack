import prisma from "../config/prisma.js";
import { getCart, clearCart } from "../services/cartService.js";
import { AppError } from "../utils/AppError.js";
export interface CreateOrderData {
  shippingAddress: string;
  contactPhone?: string;
  note?: string;
}
export const createOrder = async (
  userId: string,
  orderData: CreateOrderData,
) => {
  // 1. Sepeti çek ve kontrol et
  const cartData = await getCart(userId);
  if (!cartData.cart || cartData.cart.items.length === 0) {
    throw new AppError("Sepetiniz boş, sipariş oluşturulamaz", 400);
  }
  // 2. Stok kontrolü yap
  for (const item of cartData.cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(
        `${item.product.name} için yetersiz stok! Mevcut stok: ${item.product.stock}`,
        400,
      );
    }
  }
  // 3. Benzersiz sipariş numarası üret (Örn: ORD-1726245600000-842)
  const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  return await prisma.$transaction(async (tx) => {
    // 4. Siparişi ve sipariş kalemlerini (OrderItem) veritabanına kaydet)
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        totalAmount: cartData.totalPrice,
        shippingAddress: orderData.shippingAddress,
        contactPhone: orderData.contactPhone,
        note: orderData.note,
        items: {
          create: cartData.cart.items.map((item) => ({
            productId: item.productId,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 5. Satın alınan ürünlerin stoklarını düşür
    for (const item of cartData.cart.items) {
      const currentProduct = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!currentProduct || currentProduct.stock < item.quantity) {
        throw new AppError("Yetersiz stok", 400);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
    // 6. Sepeti temizle
    await tx.cartItem.deleteMany({
      where: { cartId: cartData.cart.id },
    });

    return order;
  });
};

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true, // Ürünün fiyatını alabilmek için product tablosunu da bağlıyoruz
        },
      },
    },
  });
};

export const getAllOrders = async () => {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: true, // Ürünün fiyatını alabilmek için product tablosunu da bağlıyoruz
        },
      },
    },
  });
};

export const getOrderById = async (
  orderId: string,
  userId: string,
  userRole: string,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Sipariş bulunamadı", 404);
  }

  // Müşteri ise ve sipariş kendisine ait değilse erişimi engelle
  if (userRole !== "ADMIN" && order.userId !== userId) {
    throw new AppError("Bu siparişi görüntüleme yetkiniz yok", 403);
  }

  return order;
};

export const updateOrderStatus = async (orderId: string, status: any) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError("Sipariş bulunamadı", 404);
  }
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};
