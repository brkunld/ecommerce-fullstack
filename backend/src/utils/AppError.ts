export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message); // Üst sınıfın (Error) constructor'ını çağırır

    this.statusCode = statusCode;
    this.isOperational = true;

    // Hata stack trace'ini temiz tutmak için
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}