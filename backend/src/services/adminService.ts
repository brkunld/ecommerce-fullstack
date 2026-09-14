// backend/src/services/adminService.ts
import prisma from "../config/prisma.js";

export const getDashboardStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count({
    where: { isActive: true },
  });
  const totalOrders = await prisma.order.count();
  const revenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: "CANCELLED" } },
  });
  const totalRevenue = revenueResult._sum.totalAmount || 0;

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 }, isActive: true },
    take: 5,
    orderBy: { stock: "asc" },
    include: { category: true },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    },
  });

  return {
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    },
    lowStockProducts,
    recentOrders,
  };
};
