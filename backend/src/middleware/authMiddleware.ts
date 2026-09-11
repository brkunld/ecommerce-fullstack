import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";
import prisma from "../config/prisma.js";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. ADIM: Token'ı Header'dan al (yazdığın if ve split mantığı buraya gelecek)
    // Eğer token yoksa veya format yanlışsa:
    // throw new AppError("Lütfen giriş yapın...", 401);
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw new AppError("Lütfen giriş yapın...", 401);
    }

    // 2. ADIM: Token'ı doğrula (verifyToken çağrılacak)
    const decoded = verifyToken(token);
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!currentUser)
      throw new AppError("Bu kullanıcı artık mevcut değil.", 401);

    // 3. ADIM: Çözülen kullanıcıyı req nesnesine ekle
    req.user = { id: currentUser.id, role: currentUser.role };

    // 4. ADIM: Bir sonraki middleware veya controller'a geçiş izni ver
    next();
  } catch (error) {
    // 1. Eğer hata zaten bizim bilerek fırlattığımız AppError ise aynen ilet
    if (error instanceof AppError) {
      return next(error);
    }
    // 2. JWT'den kaynaklı bir hata ise 401 olarak ilet
    return next(new AppError("Geçersiz veya süresi dolmuş token.", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Eğer kullanıcı hiç yoksa VEYA kullanıcının rolü izin verilenlerde yoksa:
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Bu işlem için yetkiniz bulunmamaktadır.", 403));
    }

    // 2. Yukarıdaki kontrolden sağ çıktıysa, geçiş izni ver:
    next();
  };
};
