// frontend/src/pages/admin/AdminUsersPage.tsx
import React from 'react';

export default function AdminUsersPage() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1240px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
        Kullanıcı Yönetimi (User Management)
      </h1>
      <p style={{ color: '#64748b' }}>
        Kayıtlı tüm kullanıcıları listeleme, detaylarını görüntüleme ve kullanıcı rollerini (CUSTOMER / ADMIN) yönetme burada yer alacak.
      </p>
    </div>
  );
}
