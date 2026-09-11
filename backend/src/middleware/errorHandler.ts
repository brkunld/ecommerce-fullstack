import { type Request, type Response, type NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası oluştu';

  console.error(`❌ [Hata] ${req.method} ${req.url}:`, err.message);

  interface ErrorResponse {
    status: string;
    statusCode: number;
    message: string;
    stack?: string;
  }

  // 1. Önce herkese gidecek olan standart (güvenli) cevabı hazırlıyoruz
  const responseBody: ErrorResponse = {
    status: 'error',
    statusCode: statusCode,
    message: message
  };

  // 2. Eğer geliştirme (development) ortamındaysak, hata detayını objeye sonradan ekliyoruz
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  // 3. Son olarak hazırladığımız bu objeyi gönderiyoruz
  res.status(statusCode).json(responseBody);
};
