// frontend/src/pages/admin/AdminDashboardPage.tsx
import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1240px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
        Admin Gösterge Paneli (Dashboard)
      </h1>
      <p style={{ color: '#64748b' }}>
        Sistem istatistikleri, toplam gelir, kullanıcı sayısı ve sipariş özetleri burada yer alacak.
      </p>
    </div>
  );
}
