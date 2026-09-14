// frontend/src/pages/admin/AdminProductsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import type { Product, Category } from '../../types';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrl: string;
  featured: boolean;
  isActive: boolean;
}

const initialFormState: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  imageUrl: '',
  featured: false,
  isActive: true,
};

export default function AdminProductsPage() {
  // 1. Durumlar (State)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtreleme ve Sayfalama
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Modal ve Form Durumları
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Silme Onay Modalı
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // =========================================================================
  // 2. VERİ ÇEKME FONKSİYONLARI (Kategoriler & Ürünler)
  // =========================================================================

  // Kategorileri Çekme (GET /categories)
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const catList = res.data?.data?.categories || (Array.isArray(res.data?.data) ? res.data.data : []);
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (err) {
      console.error('Kategoriler yüklenemedi:', err);
      setCategories([]);
    }
  };

  // Ürünleri Çekme (Sayfalama, Arama, Kategori Filtresi ile)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 10,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await api.get('/products', { params });
      const data = res.data?.data;

      setProducts(data?.products || []);
      setTotalPages(data?.pagination?.totalPages || 1);
      setTotalProducts(data?.pagination?.totalProducts || 0);
    } catch (err: any) {
      console.error('Ürünler yüklenemedi:', err);
      setError('Ürünler yüklenirken bir hata oluştu.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  // =========================================================================
  // 3. ÜRÜN EKLEME / DÜZENLEME
  // =========================================================================

  // Modal Açılışları
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      categoryId: categories[0]?.id || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      imageUrl: getProductImage(product.images),
      featured: !!product.featured,
      isActive: product.isActive ?? true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Ürün Kaydetme (Create veya Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Temel form doğrulamaları
    if (!formData.name.trim() || !formData.description.trim()) {
      setFormError('Lütfen ürün adı ve açıklamasını eksiksiz girin.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Geçerli bir fiyat girin (0 dan büyük olmalıdır).');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Geçerli bir stok adedi girin (0 veya daha büyük).');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceNum,
        stock: stockNum,
        categoryId: formData.categoryId,
        images: formData.imageUrl ? [formData.imageUrl.trim()] : [],
        featured: formData.featured,
        isActive: formData.isActive,
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Ürün kaydedilemedi:', err);
      setFormError(err.response?.data?.message || 'Ürün kaydedilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================================
  // 4. HIZLI STOK GÜNCELLEME
  // =========================================================================
  // Tablodan hızlıca +1 veya -1 yapıldığında çalışır
  const handleQuickStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    try {
      // Optimistic UI güncellemesi (kullanıcı anında görsün)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );

      await api.patch(`/products/${product.id}`, { stock: newStock });
    } catch (err) {
      console.error('Hızlı stok güncellenemedi:', err);
      fetchProducts();
    }
  };

  // =========================================================================
  // 5. ÜRÜN SİLME
  // =========================================================================
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      setIsDeleting(true);
      await api.delete(`/products/${deletingProduct.id}`);

      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Ürün silinemedi:', err);
      alert(err.response?.data?.message || 'Ürün silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================================
  // YARDIMCI GÖRSEL / FİYAT METOTLARI
  // =========================================================================
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  const getProductImage = (images?: string[] | string): string => {
    try {
      if (Array.isArray(images) && images.length > 0) return images[0];
      if (typeof images === 'string') {
        const trimmed = images.trim();
        if (trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
        if (trimmed.startsWith('http')) return trimmed;
      }
    } catch {
      // ignore
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Üst Başlık & Yeni Ürün Ekle Butonu */}
        <div className="admin-products-header" style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Ürün Yönetimi</h1>
            <p style={styles.pageSubtitle}>
              Toplam {totalProducts} adet ürün listeleniyor. Ürün ekleyebilir, stok ve fiyat güncelleyebilirsiniz.
            </p>
          </div>
          <button onClick={handleOpenCreateModal} style={styles.primaryBtn}>
            <Plus size={18} />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>

        {/* Filtreleme ve Arama Çubuğu */}
        <div className="admin-products-filter-bar" style={styles.filterBar}>
          <form onSubmit={handleSearchSubmit} className="admin-products-search-box" style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Ürün adı veya açıklama ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  fetchProducts();
                }}
                style={styles.clearBtn}
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Kategori Filtresi */}
          <select
            className="admin-products-category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.selectInput}
          >
            <option value="">Tüm Kategoriler</option>
            {Array.isArray(categories) &&
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Ürün Listesi Tablosu */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.centerBox}>
              <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Ürünler getiriliyor...</p>
            </div>
          ) : error ? (
            <div style={styles.centerBox}>
              <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchProducts} style={styles.secondaryBtn}>
                Tekrar Dene
              </button>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.centerBox}>
              <Package size={48} color="#cbd5e1" />
              <h3 style={{ margin: '16px 0 6px 0', color: '#0f172a', fontWeight: 700 }}>Ürün Bulunamadı</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Arama kriterlerinize uygun veya eklenmiş ürün bulunmuyor.
              </p>
            </div>
          ) : (
            <>
              {/* MASAÜSTÜ TABLOSU */}
              <div className="admin-products-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Ürün</th>
                      <th style={styles.th}>Kategori</th>
                      <th style={styles.th}>Fiyat</th>
                      <th style={styles.th}>Hızlı Stok</th>
                      <th style={styles.th}>Durum</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isLowStock = p.stock <= 5;
                      const isOutOfStock = p.stock === 0;

                      return (
                        <tr key={p.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <img
                                src={getProductImage(p.images)}
                                alt={p.name}
                                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{p.name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                  {p.featured && (
                                    <span style={styles.featuredBadge}>Öne Çıkan</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.categoryBadge}>{p.category?.name || 'Kategorisiz'}</span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>
                            {formatPrice(p.price)}
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => handleQuickStock(p, -1)}
                                disabled={p.stock === 0}
                                style={{
                                  ...styles.stockBtn,
                                  opacity: p.stock === 0 ? 0.4 : 1,
                                  cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                                }}
                                title="1 Azalt"
                              >
                                -
                              </button>
                              <span
                                style={{
                                  ...styles.stockBadge,
                                  backgroundColor: isOutOfStock ? '#fef2f2' : isLowStock ? '#fffbeb' : '#f0fdf4',
                                  color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
                                }}
                              >
                                {p.stock}
                              </span>
                              <button
                                onClick={() => handleQuickStock(p, 1)}
                                style={styles.stockBtn}
                                title="1 Artır"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: p.isActive !== false ? '#f0fdf4' : '#f1f5f9',
                                color: p.isActive !== false ? '#16a34a' : '#64748b',
                              }}
                            >
                              {p.isActive !== false ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                style={styles.iconBtn}
                                title="Ürünü Düzenle"
                              >
                                <Edit2 size={16} color="#2563eb" />
                              </button>
                              <button
                                onClick={() => setDeletingProduct(p)}
                                style={{ ...styles.iconBtn, color: '#dc2626' }}
                                title="Ürünü Sil"
                              >
                                <Trash2 size={16} color="#dc2626" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBİL ÜRÜN KARTLARI (<= 768px Kaydırma gerektirmez) */}
              <div className="admin-products-mobile-list">
                {products.map((p) => {
                  const isLowStock = p.stock <= 5;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <div key={p.id} className="admin-product-mobile-card">
                      {/* Üst Bilgi: Görsel, Başlık, Kategori, Durum */}
                      <div className="admin-product-card-top">
                        <img
                          src={getProductImage(p.images)}
                          alt={p.name}
                          className="admin-product-card-img"
                        />
                        <div className="admin-product-card-info">
                          <div className="admin-product-card-title">{p.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                            <span style={styles.categoryBadge}>{p.category?.name || 'Kategorisiz'}</span>
                            {p.featured && (
                              <span style={styles.featuredBadge}>Öne Çıkan</span>
                            )}
                          </div>
                        </div>
                        <span
                          style={{
                            ...styles.statusBadge,
                            alignSelf: 'flex-start',
                            backgroundColor: p.isActive !== false ? '#f0fdf4' : '#f1f5f9',
                            color: p.isActive !== false ? '#16a34a' : '#64748b',
                            fontSize: '11px',
                            padding: '3px 8px',
                          }}
                        >
                          {p.isActive !== false ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>

                      {/* Orta Bilgi: Fiyat ve Hızlı Stok */}
                      <div className="admin-product-card-middle">
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Fiyat</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                            {formatPrice(p.price)}
                          </div>
                        </div>

                        <div className="admin-product-card-stock-control">
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Stok:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleQuickStock(p, -1)}
                              disabled={p.stock === 0}
                              style={{
                                ...styles.stockBtn,
                                opacity: p.stock === 0 ? 0.4 : 1,
                                cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                              }}
                              title="1 Azalt"
                            >
                              -
                            </button>
                            <span
                              style={{
                                ...styles.stockBadge,
                                backgroundColor: isOutOfStock ? '#fef2f2' : isLowStock ? '#fffbeb' : '#f0fdf4',
                                color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
                              }}
                            >
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleQuickStock(p, 1)}
                              style={styles.stockBtn}
                              title="1 Artır"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Alt Butonlar: Düzenle & Sil */}
                      <div className="admin-product-card-actions">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="admin-product-card-edit-btn"
                          title="Ürünü Düzenle"
                        >
                          <Edit2 size={15} />
                          <span>Düzenle</span>
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="admin-product-card-delete-btn"
                          title="Ürünü Sil"
                        >
                          <Trash2 size={15} />
                          <span>Sil</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Sayfalama (Pagination) */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
                <span>Önceki</span>
              </button>
              <span style={styles.pageInfo}>
                Sayfa {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                <span>Sonraki</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. YENİ / DÜZENLEME MODALI */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="admin-modal-card" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
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

            <form onSubmit={handleSaveProduct} style={styles.form}>
              <div className="admin-modal-form-row" style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kablosuz Kulaklık"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kategori *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Kategori Seçin</option>
                    {Array.isArray(categories) &&
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="admin-modal-form-row" style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fiyat (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stok Adedi *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Görsel URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ürün Açıklaması *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ürün özellikleri ve detayları..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '24px', margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Öne Çıkarılan Ürün</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Satışa Açık (Aktif)</span>
                </label>
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
                    <span>{editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SİLME ONAY MODALI */}
      {/* ========================================================================= */}
      {deletingProduct && (
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
                Ürünü Silmek İstiyor Musunuz?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a' }}>"{deletingProduct.name}"</strong> kalıcı olarak silinecek veya pasife alınacaktır. Bu işlem geri alınamaz.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
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
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '280px',
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
  selectInput: {
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    minWidth: '200px',
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
  featuredBadge: {
    display: 'inline-block',
    fontSize: '11px',
    padding: '2px 6px',
    backgroundColor: '#faf5ff',
    color: '#9333ea',
    borderRadius: '4px',
    fontWeight: 600,
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
  },
  stockBadge: {
    display: 'inline-block',
    minWidth: '36px',
    textAlign: 'center',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 700,
  },
  stockBtn: {
    width: '24px',
    height: '24px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600,
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
  pagination: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #f1f5f9',
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#334155',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
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
    maxWidth: '560px',
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
