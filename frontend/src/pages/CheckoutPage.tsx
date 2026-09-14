import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, loading } = useCart();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fiyatları biçimlendirmek için yardımcı
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const res = await api.post('/orders', {
        shippingAddress,
        contactPhone,
        note,
      });

      // Başarılıysa sepeti temizle ve oluşan siparişin detayına yönlendir
      await clearCart();
      const createdOrder = res.data.data?.order;
      if (createdOrder?.id) {
        navigate(`/orders/${createdOrder.id}`);
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error('Sipariş gönderme hatası:', err);
      alert('Sipariş gönderilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !cart) {
    return (
      <div style={styles.centerBox}>
        <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Sepetiniz yükleniyor...</p>
      </div>
    );
  }

  // Empty cart case – reuse the same UI as CartPage
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIconWrapper}>
          <ShieldCheck size={48} color="#94a3b8" />
        </div>
        <h2 style={styles.emptyTitle}>Sepetiniz Boş</h2>
        <p style={styles.emptyDesc}>Sepetinizde henüz bir ürün bulunmuyor. Alışverişe devam edin!</p>
        <Link to="/products" style={styles.startShoppingBtn}>
          <ArrowLeft size={18} />
          <span>Alışverişe Başla</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={styles.container}>
      <h1 style={styles.pageTitle}>Ödeme Bilgileri</h1>
      <div className="checkout-layout" style={styles.layout}>
        {/* SOL SÜTUN: Ödeme Formu */}
        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.formLabel}>Teslimat Adresi</label>
          <textarea
            style={styles.textarea}
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Adresinizi girin..."
            required
          />

          <label style={styles.formLabel}>İletişim Telefonu</label>
          <input
            style={styles.input}
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+90 5xx xxx xx xx"
            required
          />

          <label style={styles.formLabel}>Not (Opsiyonel)</label>
          <textarea
            style={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Siparişle ilgili not ekleyebilirsiniz..."
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{submitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* SAĞ SÜTUN: Sipariş Özeti */}
        <aside style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Sipariş Özeti</h3>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Ara Toplam</span>
            <span style={styles.summaryValue}>{formatPrice(cartTotal)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Kargo</span>
            <span style={{ ...styles.summaryValue, color: '#16a34a', fontWeight: 600 }}>Ücretsiz</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Toplam Tutar</span>
            <span style={styles.totalValue}>{formatPrice(cartTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// 🎨 Stiller – mevcut CartPage stiline benzer ama form öğeleri eklenmiştir
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '36px 24px 80px 24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '28px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '36px',
    alignItems: 'start',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
  },
  submitBtn: {
    marginTop: '12px',
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.3)',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 20px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '12px',
  },
  summaryLabel: { fontSize: '14px' },
  summaryValue: { fontSize: '15px', color: '#0f172a' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '16px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  totalLabel: { fontSize: '16px', fontWeight: 700, color: '#0f172a' },
  totalValue: { fontSize: '22px', fontWeight: 800, color: '#2563eb' },
  emptyContainer: {
    padding: '100px 24px',
    textAlign: 'center',
    maxWidth: '480px',
    margin: '0 auto',
  },
  emptyIconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    backgroundColor: '#f1f5f9',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  emptyTitle: { fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' },
  emptyDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px 0' },
  startShoppingBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
  },
  centerBox: { padding: '120px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};