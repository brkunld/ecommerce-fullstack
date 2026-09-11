import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Beklenmeyen bir sunucu hatası oluştu";

  // 1. Durum: Hata bizim yazdığımız kontrollü bir AppError mu?
  if (err instanceof AppError) {
    statusCode = err.statusCode; // Örneğin: 400, 401, 404
    message = err.message; // Örneğin: "Şifreniz hatalı!"
  }
  // 2. Durum: Hayır, beklenmeyen bir sistem çökmesi (Bug) yaşandı!
  else {
    // statusCode varsayılan olarak 500 kalır.
    // Canlıdaysa kullanıcı sadece "Beklenmeyen bir sunucu hatası oluştu" görür.
    // Ama geliştirme ortamındaysan (development) hatayı çözebilmen için gerçek mesajı görürsün:
    if (process.env.NODE_ENV === "development") {
      message = err.message;
    }
  }

  console.error(`❌ [Hata] ${req.method} ${req.url}:`, err.message);

  interface ErrorResponse {
    status: string;
    statusCode: number;
    message: string;
    stack?: string;
  }

  // 1. Önce herkese gidecek olan standart (güvenli) cevabı hazırlıyoruz
  const responseBody: ErrorResponse = {
    status: "error",
    statusCode: statusCode,
    message: message,
  };

  // 2. Eğer geliştirme (development) ortamındaysak, hata detayını objeye sonradan ekliyoruz
  if (process.env.NODE_ENV === "development") {
    responseBody.stack = err.stack;
  }

  // 3. Son olarak hazırladığımız bu objeyi gönderiyoruz
  res.status(statusCode).json(responseBody);
};
