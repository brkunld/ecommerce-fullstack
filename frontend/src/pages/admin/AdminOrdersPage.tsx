// frontend/src/pages/admin/AdminOrdersPage.tsx
import React from 'react';

export default function AdminOrdersPage() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1240px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
        Sipariş Yönetimi (Order Management)
      </h1>
      <p style={{ color: '#64748b' }}>
        Tüm müşteri siparişlerini listeleme, detayları inceleme ve sipariş durumunu (PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED) güncelleme burada yer alacak.
      </p>
    </div>
  );
}
