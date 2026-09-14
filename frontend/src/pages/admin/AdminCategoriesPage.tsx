// frontend/src/pages/admin/AdminCategoriesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  FolderTree,
  X,
  AlertCircle,
  Package,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import type { Category } from '../../types';

interface ExtendedCategory extends Category {
  _count?: {
    products: number;
  };
}

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
}

const initialFormState: CategoryFormData = {
  name: '',
  description: '',
  image: '',
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal ve Form State'leri
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormState);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Silme Onay State'i
  const [deletingCategory, setDeletingCategory] = useState<ExtendedCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 1. Kategorileri Çekme
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/categories');
      const catList = res.data?.data?.categories || (Array.isArray(res.data?.data) ? res.data.data : []);
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (err) {
      console.error('Kategoriler yüklenemedi:', err);
      setError('Kategoriler yüklenirken bir sorun oluştu.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Modal Açılışları
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: ExtendedCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // 3. Kategori Kaydetme (Oluşturma & Güncelleme)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Kategori adı en az 2 karakter olmalıdır.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
      };

      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Kategori kaydedilemedi:', err);
      setFormError(err.response?.data?.message || 'Kategori kaydedilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Kategori Silme
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      setIsDeleting(true);
      await api.delete(`/categories/${deletingCategory.id}`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Kategori silinemedi:', err);
      alert(err.response?.data?.message || 'Kategori silinemedi. Bağlı ürünler olabilir.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrelenmiş kategori listesi (Arama)
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase().trim()))
  );

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Üst Başlık & Buton */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Kategori Yönetimi</h1>
            <p style={styles.pageSubtitle}>
              Toplam {categories.length} adet kategori mevcut. Yeni kategori ekleyebilir ve düzenleyebilirsiniz.
            </p>
          </div>
          <button onClick={handleOpenCreateModal} style={styles.primaryBtn}>
            <Plus size={18} />
            <span>Yeni Kategori Ekle</span>
          </button>
        </div>

        {/* Arama Çubuğu */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Kategori adı veya açıklamasıyla ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={styles.clearBtn}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Kategori Tablosu */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.centerBox}>
              <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Kategoriler yükleniyor...</p>
            </div>
          ) : error ? (
            <div style={styles.centerBox}>
              <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchCategories} style={styles.secondaryBtn}>
                Tekrar Dene
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div style={styles.centerBox}>
              <FolderTree size={48} color="#cbd5e1" />
              <h3 style={{ margin: '16px 0 6px 0', color: '#0f172a', fontWeight: 700 }}>Kategori Bulunamadı</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {searchTerm ? 'Aramanıza uygun kategori bulunamadı.' : 'Henüz hiç kategori eklenmemiş.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Görsel / Kategori</th>
                    <th style={styles.th}>Slug (URL)</th>
                    <th style={styles.th}>Açıklama</th>
                    <th style={styles.th}>Ürün Sayısı</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c) => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={styles.avatarPlaceholder}>
                              <FolderTree size={20} color="#2563eb" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{c.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <code style={styles.slugCode}>{c.slug}</code>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                          {c.description || '—'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={15} color="#64748b" />
                          <span style={styles.countBadge}>
                            {c._count?.products ?? 0} ürün
                          </span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            style={styles.iconBtn}
                            title="Kategoriyi Düzenle"
                          >
                            <Edit2 size={16} color="#2563eb" />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(c)}
                            style={{ ...styles.iconBtn, color: '#dc2626' }}
                            title="Kategoriyi Sil"
                          >
                            <Trash2 size={16} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* YENİ / DÜZENLEME MODALI */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={styles.alertError}>
                <AlertCircle size={18} color="#dc2626" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Kategori Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Elektronik, Moda, Kozmetik..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Kategori Görsel URL (Opsiyonel)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Açıklama (Opsiyonel)</label>
                <textarea
                  rows={3}
                  placeholder="Kategori hakkında kısa açıklama..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Değişiklikleri Kaydet' : 'Kategori Oluştur'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SİLME ONAY MODALI */}
      {/* ========================================================================= */}
      {deletingCategory && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', padding: '12px 0 20px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Trash2 size={26} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Kategoriyi Silmek İstiyor Musunuz?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a' }}>"{deletingCategory.name}"</strong> kategorisi silinecektir.
                {deletingCategory._count && deletingCategory._count.products > 0 && (
                  <span style={{ display: 'block', marginTop: '8px', color: '#dc2626', fontWeight: 600 }}>
                    ⚠️ Dikkat: Bu kategoriye bağlı {deletingCategory._count.products} adet ürün bulunmaktadır!
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                style={{ ...styles.cancelBtn, flex: 1 }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={{
                  ...styles.submitBtn,
                  backgroundColor: '#dc2626',
                  flex: 1,
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// 🎨 Stiller (CSS-in-JS)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  searchBox: {
    flex: 1,
    maxWidth: '420px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0 14px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '12px 0',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  clearBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '14px 20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '13px',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  avatarPlaceholder: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  slugCode: {
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    color: '#475569',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  countBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
  },
  iconBtn: {
    width: '34px',
    height: '34px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '10px 18px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    color: '#475569',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '13px',
    marginBottom: '16px',
  },
  centerBox: {
    padding: '80px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
