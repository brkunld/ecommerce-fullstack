// frontend/src/pages/admin/AdminOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Loader2,
  X,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Ban,
  User,
  MapPin,
  FileText,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import type { Order } from '../../types';

interface ExtendedOrder extends Order {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const statusConfig: {
  [key: string]: { label: string; bg: string; color: string; border: string; icon: React.ReactNode };
} = {
  PENDING: {
    label: 'Onay Bekliyor',
    bg: '#fef3c7',
    color: '#d97706',
    border: '#fde68a',
    icon: <Clock size={14} />,
  },
  PREPARING: {
    label: 'Hazırlanıyor',
    bg: '#eff6ff',
    color: '#2563eb',
    border: '#bfdbfe',
    icon: <Truck size={14} />,
  },
  SHIPPED: {
    label: 'Kargoda',
    bg: '#f5f3ff',
    color: '#7c3aed',
    border: '#ddd6fe',
    icon: <PackageCheck size={14} />,
  },
  DELIVERED: {
    label: 'Teslim Edildi',
    bg: '#f0fdf4',
    color: '#16a34a',
    border: '#bbf7d0',
    icon: <CheckCircle2 size={14} />,
  },
  CANCELLED: {
    label: 'İptal Edildi',
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fecaca',
    icon: <Ban size={14} />,
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtreleme ve Arama
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Detay Modalı
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // 1. Tüm Siparişleri Çekme (GET /api/orders/admin)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders/admin');
      const orderList = res.data?.data?.orders || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (err: any) {
      console.error('Siparişler yüklenemedi:', err);
      setError(err.response?.data?.message || 'Siparişler yüklenirken bir sorun oluştu.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Sipariş Durumu Güncelleme (PATCH /api/orders/:id/status)
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatusId(orderId);

      // Optimistic UI güncellemesi
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }

      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (err: any) {
      console.error('Sipariş durumu güncellenemedi:', err);
      alert(err.response?.data?.message || 'Sipariş durumu güncellenirken bir hata oluştu.');
      fetchOrders();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Yardımcı Fiyat & Tarih Metotları
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

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
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
  };

  // Filtrelenmiş Siparişler
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      order.orderNumber.toLowerCase().includes(term) ||
      (order.user?.name && order.user.name.toLowerCase().includes(term)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(term)) ||
      order.shippingAddress.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  // Durum Sayaçları
  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Üst Başlık */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Sipariş Yönetimi</h1>
            <p style={styles.pageSubtitle}>
              Toplam {orders.length} adet sipariş mevcut. Müşteri siparişlerini inceleyebilir ve durumlarını güncelleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Durum Sekmeleri (Filter by Status) */}
        <div style={styles.statusTabs}>
          {[
            { key: 'ALL', label: 'Tümü' },
            { key: 'PENDING', label: 'Onay Bekliyor' },
            { key: 'PREPARING', label: 'Hazırlanıyor' },
            { key: 'SHIPPED', label: 'Kargoda' },
            { key: 'DELIVERED', label: 'Teslim Edildi' },
            { key: 'CANCELLED', label: 'İptal Edildi' },
          ].map((tab) => {
            const isSelected = selectedStatus === tab.key;
            const count = statusCounts[tab.key as keyof typeof statusCounts] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                style={{
                  ...styles.statusTabBtn,
                  backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#64748b',
                  border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    ...styles.tabBadge,
                    backgroundColor: isSelected ? '#334155' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Arama Çubuğu */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Sipariş No (ORD-...), müşteri adı veya e-posta ile ara..."
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

        {/* Sipariş Tablosu */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.centerBox}>
              <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Siparişler yükleniyor...</p>
            </div>
          ) : error ? (
            <div style={styles.centerBox}>
              <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchOrders} style={styles.secondaryBtn}>
                Tekrar Dene
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={styles.centerBox}>
              <ShoppingBag size={48} color="#cbd5e1" />
              <h3 style={{ margin: '16px 0 6px 0', color: '#0f172a', fontWeight: 700 }}>Sipariş Bulunamadı</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {searchTerm || selectedStatus !== 'ALL'
                  ? 'Filtreleme kriterlerinize uygun sipariş bulunamadı.'
                  : 'Henüz mağazanızdan sipariş verilmemiş.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Sipariş No</th>
                    <th style={styles.th}>Müşteri</th>
                    <th style={styles.th}>Tarih</th>
                    <th style={styles.th}>Tutar</th>
                    <th style={styles.th}>Ürün Adedi</th>
                    <th style={styles.th}>Durum</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const badge = statusConfig[order.status] || statusConfig.PENDING;
                    const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                    return (
                      <tr key={order.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                            {order.orderNumber}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>
                              {order.user?.name || 'Müşteri'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {order.user?.email || '—'}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 800, color: '#0f172a' }}>
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.countBadge}>{totalQty} ürün</span>
                        </td>
                        <td style={styles.td}>
                          <select
                            value={order.status}
                            disabled={updatingStatusId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{
                              ...styles.statusSelect,
                              backgroundColor: badge.bg,
                              color: badge.color,
                              borderColor: badge.border,
                            }}
                          >
                            <option value="PENDING">Onay Bekliyor</option>
                            <option value="PREPARING">Hazırlanıyor</option>
                            <option value="SHIPPED">Kargoda</option>
                            <option value="DELIVERED">Teslim Edildi</option>
                            <option value="CANCELLED">İptal Edildi</option>
                          </select>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={styles.detailBtn}
                            title="Sipariş Detayını Görüntüle"
                          >
                            <Eye size={16} />
                            <span>İncele</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SİPARİŞ DETAY MODALI */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '680px' }}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={styles.modalTitle}>{selectedOrder.orderNumber}</h2>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: (statusConfig[selectedOrder.status] || statusConfig.PENDING).bg,
                      color: (statusConfig[selectedOrder.status] || statusConfig.PENDING).color,
                      borderColor: (statusConfig[selectedOrder.status] || statusConfig.PENDING).border,
                    }}
                  >
                    {(statusConfig[selectedOrder.status] || statusConfig.PENDING).label}
                  </span>
                </div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Sipariş Tarihi: {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Müşteri ve Teslimat Bilgileri */}
              <div style={styles.detailGrid}>
                {/* Müşteri Bilgileri */}
                <div style={styles.infoCard}>
                  <div style={styles.infoCardHeader}>
                    <User size={16} color="#2563eb" />
                    <span>Müşteri Bilgileri</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Ad Soyad:</span>
                    <span style={styles.infoValue}>{selectedOrder.user?.name || 'Belirtilmemiş'}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>E-posta:</span>
                    <span style={styles.infoValue}>{selectedOrder.user?.email || 'Belirtilmemiş'}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Telefon:</span>
                    <span style={styles.infoValue}>
                      {selectedOrder.contactPhone || selectedOrder.user?.phone || 'Belirtilmemiş'}
                    </span>
                  </div>
                </div>

                {/* Teslimat Adresi */}
                <div style={styles.infoCard}>
                  <div style={styles.infoCardHeader}>
                    <MapPin size={16} color="#16a34a" />
                    <span>Teslimat Adresi</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    {selectedOrder.shippingAddress}
                  </p>
                  {selectedOrder.note && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                        <FileText size={14} />
                        <span>Sipariş Notu:</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#0f172a', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                        "{selectedOrder.note}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Siparişteki Ürünler */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Sipariş Edilen Ürünler ({selectedOrder.items?.length || 0})
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Ürün</th>
                        <th style={styles.th}>Birim Fiyat</th>
                        <th style={styles.th}>Adet</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={getProductImage(item.product?.images)}
                                alt={item.product?.name || 'Ürün'}
                                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                                  {item.product?.name || 'Ürün'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>{formatPrice(item.price)}</td>
                          <td style={styles.td}>x {item.quantity}</td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fiyat Özeti & Durum Değiştirici */}
              <div style={styles.modalBottomBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Durumu Güncelle:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    style={styles.modalSelect}
                  >
                    <option value="PENDING">Onay Bekliyor</option>
                    <option value="PREPARING">Hazırlanıyor</option>
                    <option value="SHIPPED">Kargoda</option>
                    <option value="DELIVERED">Teslim Edildi</option>
                    <option value="CANCELLED">İptal Edildi</option>
                  </select>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Genel Toplam:</span>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                    {formatPrice(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>
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
    marginBottom: '24px',
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
  statusTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  statusTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  searchBox: {
    flex: 1,
    maxWidth: '480px',
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
  countBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
  },
  statusSelect: {
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    borderWidth: '1px',
    borderStyle: 'solid',
    outline: 'none',
    cursor: 'pointer',
  },
  detailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
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
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    fontFamily: 'monospace',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 700,
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748b',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '10px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '6px',
  },
  infoLabel: {
    color: '#64748b',
  },
  infoValue: {
    fontWeight: 600,
    color: '#0f172a',
  },
  modalBottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '16px',
  },
  modalSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
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
