// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading, isAdmin } = useAuth();

  // 1. TODO: isLoading true ise bir yükleniyor mesajı dön (ekran titremesin)
  if (isLoading) return <div>Yükleniyor...</div>;

  // 2. TODO: user yoksa login sayfasına yönlendir
  if (!user) return <Navigate to="/login" replace />;

  // 3. TODO: adminOnly true ama kullanıcı admin değilse anasayfaya yönlendir
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  // 4. Bütün şartlar sağlandıysa içeriği göster
  return <>{children}</>;
};

export default ProtectedRoute;
