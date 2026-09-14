// frontend/src/pages/admin/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import type { Product, Order } from '../../types';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface DashboardData {
  stats: DashboardStats;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        setData(res.data.data);
      } catch (err) {
        console.error('İstatistikler yüklenemedi:', err);
        setError('İstatistikler yüklenemedi. Lütfen internet bağlantınızı ve yetkinizi kontrol edin.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fiyat formatlama
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  // Tarih formatlama
  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  // Ürün görseli güvenli ayrıştırma
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
      // fallback
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
  };

  // Sipariş durumu rozeti konfigürasyonu
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { label: 'Teslim Edildi', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'SHIPPED':
        return { label: 'Kargoda', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'PREPARING':
        return { label: 'Hazırlanıyor', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'CANCELLED':
        return { label: 'İptal', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      default:
        return { label: 'Onay Bekliyor', bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
    }
  };

  // Yükleniyor Durumu
  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.centerBox}>
          <Loader2 size={44} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>
            Yönetim paneli yükleniyor...
          </p>
        </div>
      </AdminLayout>
    );
  }

  // Hata Durumu
  if (error || !data) {
    return (
      <AdminLayout>
        <div style={styles.centerBox}>
          <p style={{ color: '#dc2626', fontSize: '16px', marginBottom: '16px' }}>
            {error || 'Veriler alınamadı.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { stats, lowStockProducts, recentOrders } = data;

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Üst Başlık */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSubtitle}>Mağazanızın anlık performans özeti ve kritik bildirimleri</p>
        </div>

        {/* 4 ADET İSTATİSTİK KARTI */}
        <div style={styles.statsGrid}>
          {/* 1. Toplam Gelir Kartı */}
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, backgroundColor: '#f0fdf4' }}>
              <TrendingUp size={24} color="#16a34a" />
            </div>
            <div>
              <span style={styles.statLabel}>Toplam Gelir (Ciro)</span>
              <h3 style={styles.statValue}>{formatPrice(stats?.totalRevenue || 0)}</h3>
            </div>
          </div>

          {/* 2. Toplam Sipariş Kartı */}
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, backgroundColor: '#eff6ff' }}>
              <ShoppingBag size={24} color="#2563eb" />
            </div>
            <div>
              <span style={styles.statLabel}>Toplam Sipariş</span>
              <h3 style={styles.statValue}>{stats?.totalOrders || 0}</h3>
            </div>
          </div>

          {/* 3. Aktif Ürün Kartı */}
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, backgroundColor: '#faf5ff' }}>
              <Package size={24} color="#9333ea" />
            </div>
            <div>
              <span style={styles.statLabel}>Aktif Ürün Sayısı</span>
              <h3 style={styles.statValue}>{stats?.totalProducts || 0}</h3>
            </div>
          </div>

          {/* 4. Toplam Kullanıcı Kartı */}
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, backgroundColor: '#fff7ed' }}>
              <Users size={24} color="#ea580c" />
            </div>
            <div>
              <span style={styles.statLabel}>Kayıtlı Müşteri</span>
              <h3 style={styles.statValue}>{stats?.totalUsers || 0}</h3>
            </div>
          </div>
        </div>

        {/* İKİ BÜYÜK TABLO BÖLÜMÜ (Kritik Stok & Son Siparişler) */}
        <div style={styles.tablesGrid}>
          {/* TABLO 1: Kritik / Düşük Stoklu Ürünler */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <AlertTriangle size={20} color="#d97706" />
                <span>Kritik Stok Uyarıları ({lowStockProducts?.length || 0})</span>
              </div>
              <Link to="/admin/products" style={styles.cardLink}>
                Tüm Ürünler →
              </Link>
            </div>

            <div style={styles.tableWrapper}>
              {lowStockProducts && lowStockProducts.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Ürün</th>
                      <th style={styles.th}>Kategori</th>
                      <th style={styles.th}>Fiyat</th>
                      <th style={styles.th}>Kalan Stok</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((p) => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={getProductImage(p.images)}
                              alt={p.name}
                              style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: '#64748b' }}>{p.category?.name || '-'}</span>
                        </td>
                        <td style={styles.td}>{formatPrice(p.price)}</td>
                        <td style={styles.td}>
                          <span style={styles.lowStockBadge}>
                            {p.stock === 0 ? 'Tükendi (0)' : `${p.stock} adet kaldı`}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <Link to="/admin/products" style={styles.tableBtn}>
                            Yönet
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.emptyCardContent}>
                  <p style={styles.emptyText}>Tüm ürünlerin stok durumu yeterli seviyede. 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* TABLO 2: Son Verilen Siparişler */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <Clock size={20} color="#2563eb" />
                <span>Son Siparişler</span>
              </div>
              <Link to="/admin/orders" style={styles.cardLink}>
                Tüm Siparişler →
              </Link>
            </div>

            <div style={styles.tableWrapper}>
              {recentOrders && recentOrders.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Sipariş No</th>
                      <th style={styles.th}>Müşteri</th>
                      <th style={styles.th}>Tarih</th>
                      <th style={styles.th}>Tutar</th>
                      <th style={styles.th}>Durum</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Detay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      const customerName = (order as any).user?.name || 'Müşteri';
                      return (
                        <tr key={order.id} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{order.orderNumber}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#334155', fontWeight: 500 }}>{customerName}</span>
                          </td>
                          <td style={styles.td}>{formatDate(order.createdAt)}</td>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: badge.bg,
                                color: badge.color,
                                borderColor: badge.border,
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <Link to={`/orders/${order.id}`} style={styles.tableBtn}>
                              <span>İncele</span>
                              <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={styles.emptyCardContent}>
                  <p style={styles.emptyText}>Henüz hiç sipariş verilmemiş.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// 🎨 Modern & Responsive Stiller
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '28px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  statIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
    display: 'block',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  cardLink: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#2563eb',
    textDecoration: 'none',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '12px 20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 20px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  lowStockBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '12px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 700,
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  tableBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '12px',
    transition: 'background-color 0.2s',
  },
  emptyCardContent: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  centerBox: {
    padding: '120px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
