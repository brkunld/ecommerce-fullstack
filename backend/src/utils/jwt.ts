import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  role: string;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'super-secret-jwt-key-burak-ecommerce-2026';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

// 1. Yeni Token Üret
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// 2. Token Doğrula
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

