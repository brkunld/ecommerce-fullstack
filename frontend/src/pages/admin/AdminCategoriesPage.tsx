import AdminLayout from '../../components/AdminLayout';

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Kategori Yönetimi (Category Management)
        </h1>
        <p style={{ color: '#64748b' }}>
          Kategori listeleme, yeni kategori ekleme, düzenleme ve silme işlemleri burada yer alacak.
        </p>
      </div>
    </AdminLayout>
  );
}
