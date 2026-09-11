import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../services/userService.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import prisma from "../config/prisma.js";

// 1. REGISTER (Kayıt Olma)
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name, phone, address } = req.body;

    // Email veritabanında daha önce kayıt edilmiş mi?
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError("Bu e-posta adresi zaten kullanılıyor", 400);
    }

    // Şifreyi 10 tuzlama (salt) turu ile hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluştur
    const user = await createUser({
      email,
      name,
      password: hashedPassword,
      phone,
      address,
    });

    // Kullanıcıya hemen boş bir alışveriş sepeti aç
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // Otomatik giriş için JWT kimlik kartı üret
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    res.status(201).json({
      status: "success",
      message: "Kayıt işlemi başarıyla tamamlandı",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. LOGIN (Giriş Yapma)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı var mı kontrol et (Şifreli halini de çeker)
    const user = await findUserByEmail(email);
    if (!user) {
      throw new AppError("Geçersiz e-posta veya şifre", 401);
    }

    // Şifre eşleşiyor mu kontrol et
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError("Geçersiz e-posta veya şifre", 401);
    }

    // JWT kimlik kartı üret
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    // Şifreyi hariç tutup sadece güvenli kullanıcı alanlarını seçiyoruz
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      status: "success",
      message: "Giriş başarılı",
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
