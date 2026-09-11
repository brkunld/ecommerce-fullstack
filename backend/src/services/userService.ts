import prisma from '../config/prisma.js';
import { type Role } from '@prisma/client';

// Dışarıya şifresiz dönülecek güvenli alanlar
export const userSafeSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  address: true,
  createdAt: true,
  updatedAt: true,
};

// 1. Email ile kullanıcı bul (Şifre kontrolü / Login için şifreli halini de çeker)
export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// 2. ID ile kullanıcı bul (Güvenli profil bilgisi)
export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: userSafeSelect,
  });
};

// 3. Tüm kullanıcıları listele (Admin için)
export const getAllUsers = () => {
  return prisma.user.findMany({
    select: userSafeSelect,
    orderBy: { createdAt: 'desc' },
  });
};

// 4. Yeni kullanıcı oluştur
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: Role;
  phone?: string;
  address?: string;
}

export const createUser = (data: CreateUserData) => {
  return prisma.user.create({
    data,
    select: userSafeSelect,
  });
};

// 5. Kullanıcı güncelle
export const updateUser = (id: string, data: Partial<Omit<CreateUserData, 'password'>>) => {
  return prisma.user.update({
    where: { id },
    data,
    select: userSafeSelect,
  });
};

// 6. Kullanıcı sil
export const deleteUser = (id: string) => {
  return prisma.user.delete({
    where: { id },
    select: userSafeSelect,
  });
};

