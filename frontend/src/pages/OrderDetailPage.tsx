// frontend/src/pages/OrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import type { Order } from '../types';

export default function OrderDetailPage() {
  // 💡 İPUCU 1: URL'den sipariş id'sini almak için useParams kullanın
  const { id } = useParams<{ id: string }>();

  // 💡 İPUCU 2: Sayfa durumları (state'ler)
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 💡 İPUCU 3: Backend'den sipariş detayını çeken fonksiyon
  useEffect(() => {
    const fetchOrderDetail = async () => {
        if(!id){
            setError('Sipariş bulunamadı...');
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data.data.order);
        } catch {
            setError('Sipariş yüklenemedi...');
        } finally {
            setLoading(false);
        }

    };

    fetchOrderDetail();
  }, [id]);

  // 💡 İPUCU 4: Yükleniyor ve Hata durumlarının kontrolü
  if (loading) {
    return (
      <div style={styles.centerBox}>
        {/*  Loader2 ikonu ve "Sipariş detayları yükleniyor..." mesajı */}
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-600">Sipariş detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.centerBox}>
        {/*  Sipariş bulunamadı uyarısı ve "Siparişlerime Dön" butonu (<Link to="/orders">) */}
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">Sipariş bulunamadı...</p>
        <Link to="/orders" className="text-orange-500 hover:underline mt-4">
          Siparişlerime Dön
        </Link>
      </div>
    );
  }

  // 💡 İPUCU 5: Yardımcı fonksiyonlar (Fiyat ve Tarih formatlama)
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  const formatDate = (isoString: string) =>
    new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));

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

  const statusConfig = getStatusConfig(order.status);

  return (
    <div style={styles.container}>
      {/* Üst Gezinme Çubuğu */}
      <Link to="/orders" style={styles.backLink}>
        <ArrowLeft size={18} />
        <span>Siparişlerime Dön</span>
      </Link>

      {/* Başlık Alanı (Sipariş Numarası, Tarih ve Durum Rozeti) */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sipariş Detayı</h1>
          <p style={styles.subtitle}>
            Sipariş Numarası: <strong>{order.orderNumber}</strong> •{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {formatDate(order.createdAt)}
            </span>
          </p>
        </div>

        <div
          style={{
            ...styles.badge,
            color: statusConfig.color,
            backgroundColor: statusConfig.bg,
            borderColor: statusConfig.border,
          }}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/*  İki Sütunlu Grid Düzeni (Sol: Ürün Listesi, Sağ: Teslimat & Özet Kartı) */}
      <div style={styles.layout}>
        {/* SOL KOLON: Sipariş Edilen Ürünler (order.items.map) */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <Package size={20} color="#2563eb" />
                <span>Sipariş Edilen Ürünler ({order.items.length})</span>
              </div>
            </div>
            <div style={styles.itemsList}>
              {order.items.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                    alt={item.product?.name || 'Ürün'}
                    style={styles.itemImage}
                  />
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.product?.name || 'Ürün'}</h3>
                    <p style={styles.itemMeta}>
                      Birim Fiyat: {formatPrice(item.price)} • Adet: {item.quantity}
                    </p>
                  </div>
                  <div style={styles.itemTotal}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: Teslimat Adresi, İletişim Telefonu, Sipariş Notu ve Toplam Tutar */}
        <div style={styles.rightCol}>
          {/* Teslimat Bilgileri Kartı */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <MapPin size={20} color="#059669" />
                <span>Teslimat Bilgileri</span>
              </div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <MapPin size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span style={styles.infoText}>{order.shippingAddress}</span>
              </div>
              {order.contactPhone && (
                <div style={styles.infoRow}>
                  <Phone size={16} color="#64748b" style={{ flexShrink: 0 }} />
                  <span style={styles.infoText}>{order.contactPhone}</span>
                </div>
              )}
              {order.note && (
                <div style={styles.noteBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                    <FileText size={15} />
                    <span>Sipariş Notu:</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fiyat ve Özet Kartı */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <FileText size={20} color="#7c3aed" />
                <span>Sipariş Özeti</span>
              </div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Ara Toplam</span>
                <span style={styles.summaryValue}>{formatPrice(order.totalAmount)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Kargo Ücreti</span>
                <span style={{ ...styles.summaryValue, color: '#16a34a', fontWeight: 600 }}>Ücretsiz</span>
              </div>
              <div style={{ ...styles.summaryRow, borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '6px' }}>
                <span style={styles.totalLabel}>Toplam Tutar</span>
                <span style={styles.totalValue}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎨 Stil Nesneleri
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '36px 24px 80px 24px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '20px',
    transition: 'color 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '6px 0 0 0',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: 700,
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '32px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafafa',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  itemImage: {
    width: '64px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  itemMeta: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  itemTotal: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '14px',
    color: '#334155',
  },
  infoText: {
    lineHeight: 1.5,
  },
  noteBox: {
    backgroundColor: '#fefce8',
    border: '1px solid #fef08a',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '4px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  summaryLabel: {
    color: '#64748b',
  },
  summaryValue: {
    color: '#0f172a',
    fontWeight: 500,
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#2563eb',
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
