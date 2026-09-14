// frontend/src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  ChevronRight,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import type { Order } from '../types';
import api from '../services/api'; // TODO: Backend bağlantısını açarken aktif edin

// =============================================================================
// 🎨 ÖRNEK (MOCK) SİPARİŞ VERİLERİ (Görsel Önizleme İçin)
// =============================================================================
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 'ORD-2026-89412',
    userId: 'usr_1',
    status: 'PREPARING',
    totalAmount: 18450,
    shippingAddress: 'Atatürk Mah. Karanfil Sok. No: 12 D: 4, Kadıköy / İstanbul',
    contactPhone: '+90 532 111 22 33',
    note: 'Lütfen zile basmadan önce telefonla arayınız.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 saat önce
    items: [
      {
        id: 'item_1',
        orderId: 'ord_101',
        productId: 'prod_1',
        price: 15450,
        quantity: 1,
        product: {
          id: 'prod_1',
          name: 'Kablosuz Aktif Gürültü Önleyici Kulaklık Pro',
          slug: 'kablosuz-gurultu-onleyici-kulaklik',
          description: 'Premium ses kalitesi, 40 saat pil ömrü',
          price: 15450,
          stock: 25,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
          categoryId: 'cat_1',
        },
      },
      {
        id: 'item_2',
        orderId: 'ord_101',
        productId: 'prod_2',
        price: 1500,
        quantity: 2,
        product: {
          id: 'prod_2',
          name: 'Hızlı Şarj Destekli Manyetik Örgü Kablo (2m)',
          slug: 'manyetik-orgu-sarj-kablosu',
          description: 'Dayanıklı örgü kaplama, 100W PD desteği',
          price: 1500,
          stock: 140,
          images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'],
          categoryId: 'cat_1',
        },
      },
    ],
  },
  {
    id: 'ord_102',
    orderNumber: 'ORD-2026-77301',
    userId: 'usr_1',
    status: 'DELIVERED',
    totalAmount: 3200,
    shippingAddress: 'Çankaya Mah. Tunalı Hilmi Cad. No: 45/8, Çankaya / Ankara',
    contactPhone: '+90 533 999 88 77',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 gün önce
    items: [
      {
        id: 'item_3',
        orderId: 'ord_102',
        productId: 'prod_3',
        price: 3200,
        quantity: 1,
        product: {
          id: 'prod_3',
          name: 'Akıllı Ergonomik Paslanmaz Çelik Termos (750ml)',
          slug: 'ergonomik-paslanmaz-celik-termos',
          description: '24 saat soğuk, 12 saat sıcak tutma performansı',
          price: 3200,
          stock: 60,
          images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'],
          categoryId: 'cat_2',
        },
      },
    ],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // ===========================================================================
  // 🚀 BACKEND ENTEGRASYONU (TODO)
  // ===========================================================================
  useEffect(() => {
  
    // TODO 1: Backend'den siparişleri çekmek için aşağıdaki kodu aktif edin:
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // GET /api/orders endpoint'i kullanıcının kendi siparişlerini getirir
        const res = await api.get('/orders');
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error('Siparişler yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

  }, []);

  // Fiyat formatlayıcı
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Tarih formatlayıcı
  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  // Ürün görselini güvenli şekilde alma
  const getProductImage = (images?: string[] | string): string => {
    try {
      if (Array.isArray(images) && images.length > 0) return images[0];
      if (typeof images === 'string') {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        return images;
      }
    } catch {
      // fallback
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
  };

  // Sipariş durumu konfigürasyonu (badge renkleri, etiket ve ikon)
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Onay Bekliyor',
          color: '#d97706',
          bg: '#fef3c7',
          border: '#fde68a',
          icon: <Clock size={16} />,
        };
      case 'PREPARING':
        return {
          label: 'Hazırlanıyor',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
          icon: <Package size={16} />,
        };
      case 'SHIPPED':
        return {
          label: 'Kargoya Verildi',
          color: '#7c3aed',
          bg: '#f5f3ff',
          border: '#ddd6fe',
          icon: <Truck size={16} />,
        };
      case 'DELIVERED':
        return {
          label: 'Teslim Edildi',
          color: '#16a34a',
          bg: '#f0fdf4',
          border: '#bbf7d0',
          icon: <CheckCircle2 size={16} />,
        };
      case 'CANCELLED':
        return {
          label: 'İptal Edildi',
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#fecaca',
          icon: <XCircle size={16} />,
        };
      default:
        return {
          label: status,
          color: '#475569',
          bg: '#f1f5f9',
          border: '#e2e8f0',
          icon: <Package size={16} />,
        };
    }
  };

  // Sekme filtreleme mantığı
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ACTIVE') {
      return ['PENDING', 'PREPARING', 'SHIPPED'].includes(order.status);
    }
    if (activeTab === 'COMPLETED') {
      return ['DELIVERED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  // Yükleniyor Durumu
  if (loading) {
    return (
      <div style={styles.centerBox}>
        <Loader2 size={44} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>
          Siparişleriniz yükleniyor...
        </p>
      </div>
    );
  }

  // Sipariş Bulunmadığında
  if (!orders || orders.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIconWrapper}>
          <ShoppingBag size={48} color="#94a3b8" />
        </div>
        <h2 style={styles.emptyTitle}>Henüz Siparişiniz Bulunmuyor</h2>
        <p style={styles.emptyDesc}>
          Verdiğiniz tüm siparişlerin durumunu ve geçmişini buradan kolayca takip edebilirsiniz.
          Beğendiğiniz ürünleri sepetinize ekleyerek ilk siparişinizi oluşturun!
        </p>
        <Link to="/products" style={styles.startShoppingBtn}>
          <ArrowLeft size={18} />
          <span>Alışverişe Başla</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container orders-page-container">
      {/* Üst Başlık ve İstatistik Bilgisi */}
      <div className="orders-header-row">
        <div>
          <h1 className="orders-page-title">Siparişlerim</h1>
          <p className="orders-page-subtitle">
            Geçmiş ve mevcut tüm siparişlerinizin durumunu buradan takip edebilirsiniz.
          </p>
        </div>
        <div className="orders-total-badge" style={styles.totalBadge}>
          <Package size={18} color="#2563eb" />
          <span>Toplam {orders.length} Sipariş</span>
        </div>
      </div>

      {/* Filtre Sekmeleri (Kategoriler) */}
      <div className="orders-tabs-container">
        <button
          className={`orders-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'ALL' ? styles.activeTabBtn : {}),
          }}
          onClick={() => setActiveTab('ALL')}
        >
          Tüm Siparişler ({orders.length})
        </button>
        <button
          className={`orders-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'ACTIVE' ? styles.activeTabBtn : {}),
          }}
          onClick={() => setActiveTab('ACTIVE')}
        >
          Devam Edenler ({orders.filter((o) => ['PENDING', 'PREPARING', 'SHIPPED'].includes(o.status)).length})
        </button>
        <button
          className={`orders-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'COMPLETED' ? styles.activeTabBtn : {}),
          }}
          onClick={() => setActiveTab('COMPLETED')}
        >
          Tamamlananlar ({orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status)).length})
        </button>
      </div>

      {/* Sipariş Kartları Listesi */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div style={styles.noFilterResult}>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Bu filtreye uygun sipariş bulunamadı.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div key={order.id} className="order-card" style={styles.orderCard}>
                {/* 1. KART BAŞLIĞI (Üst Şerit) */}
                <div className="order-card-header">
                  <div className="order-header-col">
                    <span style={styles.metaLabel}>SİPARİŞ NUMARASI</span>
                    <span style={styles.orderNumber}>{order.orderNumber}</span>
                  </div>

                  <div className="order-header-col">
                    <span style={styles.metaLabel}>SİPARİŞ TARİHİ</span>
                    <div style={styles.metaWithIcon}>
                      <Calendar size={14} color="#64748b" />
                      <span style={styles.metaValue}>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="order-header-col">
                    <span style={styles.metaLabel}>TOPLAM TUTAR</span>
                    <span style={styles.totalPriceText}>{formatPrice(order.totalAmount)}</span>
                  </div>

                  {/* Durum Rozeti */}
                  <div
                    className="order-status-badge-wrapper"
                    style={{
                      ...styles.statusBadge,
                      color: statusConfig.color,
                      backgroundColor: statusConfig.bg,
                      borderColor: statusConfig.border,
                    }}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>

                  {/* Detay Butonu */}
                  <Link to={`/orders/${order.id}`} className="order-detail-btn" style={styles.detailBtn}>
                    <span>Detayları Gör</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>

                {/* 2. KART İÇERİĞİ (Ürün Listesi & Bilgiler) */}
                <div className="order-card-body">
                  {/* Sol Bölüm: Ürünlerin Önizlemesi */}
                  <div className="order-items-preview">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item-row" style={styles.itemRow}>
                        <div style={styles.imageContainer}>
                          <img
                            src={getProductImage(item.product?.images)}
                            alt={item.product?.name || 'Ürün'}
                            style={styles.itemImg}
                          />
                        </div>
                        <div style={styles.itemInfo}>
                          <Link
                            to={`/products/${item.productId}`}
                            style={styles.itemName}
                            title={item.product?.name}
                          >
                            {item.product?.name || 'Ürün Bilgisi'}
                          </Link>
                          <div style={styles.itemMeta}>
                            <span>Adet: <strong>{item.quantity}</strong></span>
                            <span style={styles.dot}>•</span>
                            <span>Birim Fiyat: <strong>{formatPrice(item.price)}</strong></span>
                          </div>
                        </div>
                        <div className="order-item-subtotal" style={styles.itemSubtotal}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sağ Bölüm: Teslimat & Özet Notu */}
                  <div className="order-card-sidebar" style={styles.cardSidebar}>
                    <div style={styles.sidebarBox}>
                      <div style={styles.sidebarTitle}>
                        <MapPin size={16} color="#2563eb" />
                        <span>Teslimat Adresi</span>
                      </div>
                      <p style={styles.addressText}>{order.shippingAddress}</p>
                      {order.contactPhone && (
                        <p style={styles.phoneText}>📞 {order.contactPhone}</p>
                      )}
                    </div>

                    {order.note && (
                      <div style={{ ...styles.sidebarBox, marginTop: '12px', backgroundColor: '#f8fafc' }}>
                        <div style={styles.sidebarTitle}>
                          <CreditCard size={15} color="#64748b" />
                          <span>Sipariş Notu</span>
                        </div>
                        <p style={styles.noteText}>"{order.note}"</p>
                      </div>
                    )}

                    <div style={styles.summaryFooter}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Toplam <strong>{totalItemsCount}</strong> adet ürün
                      </span>
                      <Link to={`/orders/${order.id}`} style={styles.quickDetailLink}>
                        Fatura / Detay <ExternalLink size={13} style={{ marginLeft: '4px' }} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// =============================================================================
// 🎨 MODERN & PREMIUM STİLLER
// =============================================================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '36px 24px 80px 24px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '28px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: '6px 0 0 0',
  },
  totalBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '8px 16px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '14px',
    border: '1px solid #dbeafe',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  tabBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTabBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.2s ease',
  },
  cardHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '18px',
  },
  cardHeaderCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.6px',
  },
  orderNumber: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
  },
  metaWithIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaValue: {
    fontSize: '13px',
    color: '#475569',
    fontWeight: 500,
  },
  totalPriceText: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#2563eb',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: 700,
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  detailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    color: '#1e293b',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  cardBody: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '32px',
    alignItems: 'start',
  },
  itemsPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  imageContainer: {
    width: '68px',
    height: '68px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  itemMeta: {
    fontSize: '13px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    color: '#cbd5e1',
  },
  itemSubtotal: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    paddingLeft: '12px',
  },
  cardSidebar: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  sidebarTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
  },
  addressText: {
    fontSize: '13px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.5',
  },
  phoneText: {
    fontSize: '12px',
    color: '#64748b',
    margin: '6px 0 0 0',
    fontWeight: 500,
  },
  noteText: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#64748b',
    margin: 0,
  },
  summaryFooter: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
  },
  quickDetailLink: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: '#2563eb',
    textDecoration: 'none',
  },
  noFilterResult: {
    padding: '48px 0',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
  },
  centerBox: {
    padding: '120px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: '100px 24px',
    textAlign: 'center',
    maxWidth: '520px',
    margin: '0 auto',
  },
  emptyIconWrapper: {
    width: '84px',
    height: '84px',
    borderRadius: '22px',
    backgroundColor: '#f1f5f9',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 10px 0',
  },
  emptyDesc: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: '0 0 28px 0',
  },
  startShoppingBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.3)',
  },
};