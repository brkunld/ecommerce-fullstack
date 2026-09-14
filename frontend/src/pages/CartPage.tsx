// frontend/src/pages/CartPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../types';

export default function CartPage() {
  const { cart, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  // Fiyat formatlama yardımcısı
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Güvenli görsel alma
  const getItemImage = (item: CartItem): string => {
    try {
      if (item.product?.images) {
        if (Array.isArray(item.product.images) && item.product.images.length > 0) {
          return item.product.images[0];
        }
        if (typeof item.product.images === 'string') {
          const parsed = JSON.parse(item.product.images);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
      }
    } catch {
      // fallback
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
  };

  if (loading && !cart) {
    return (
      <div style={styles.centerBox}>
        <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Sepetiniz yükleniyor...</p>
      </div>
    );
  }

  // Sepet Boş İse Gösterilecek Alan
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty-container">
        <div style={styles.emptyIconWrapper}>
          <ShoppingBag size={48} color="#94a3b8" />
        </div>
        <h2 className="cart-empty-title">Sepetiniz Boş</h2>
        <p className="cart-empty-desc">
          Sepetinizde henüz bir ürün bulunmuyor. Binlerce kaliteli ürün arasından dilediğinizi seçip alışverişe başlayabilirsiniz!
        </p>
        <Link to="/products" className="cart-empty-btn">
          <ArrowLeft size={18} />
          <span>Alışverişe Başla</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container cart-page-container">
      <h1 className="cart-title">Alışveriş Sepetim ({cart.items.length} Farklı Ürün)</h1>

      <div className="cart-layout">
        {/* SOL SÜTUN: Sepetteki Ürünler Listesi */}
        <div className="cart-items-list">
          {cart.items.map((item) => {
            const itemPrice = Number(item.product?.price || 0);
            const lineTotal = itemPrice * item.quantity;

            return (
              <div key={item.id} className="cart-item-card">
                {/* Ürün Görseli */}
                <Link to={`/products/${item.productId}`} className="cart-item-image-link">
                  <img src={getItemImage(item)} alt={item.product?.name} className="cart-item-image" />
                </Link>

                {/* Ürün Bilgisi */}
                <div className="cart-item-info">
                  <Link to={`/products/${item.productId}`} className="cart-item-title">
                    {item.product?.name}
                  </Link>
                  <span className="cart-item-price">{formatPrice(itemPrice)} / adet</span>
                </div>

                {/* Miktar Artırma / Azaltma Kontrolleri */}
                <div className="cart-item-quantity">
                  <button
                    className="cart-qty-btn"
                    onClick={() => {
                      if(item.quantity > 1){
                        updateQuantity(item.id,item.quantity-1);
                      }else{
                        removeFromCart(item.id)
                      }
                    }}
                  >
                    -
                  </button>
                  <span className="cart-qty-text">{item.quantity}</span>
                  <button
                    className="cart-qty-btn"
                    onClick={() => {
                      updateQuantity(item.id, item.quantity + 1);
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Satır Toplam Fiyatı */}
                <div className="cart-item-line-price">
                  <span className="cart-line-price-text">{formatPrice(lineTotal)}</span>
                </div>

                {/* Silme Butonu */}
                <button
                  className="cart-item-delete-btn"
                  title="Ürünü Sepetten Kaldır"
                  onClick={() => {
                    removeFromCart(item.id)
                  }}
                >
                  <Trash2 size={18} color="#ef4444" />
                </button>
              </div>
            );
          })}

          {/* Sepeti Boşalt Butonu */}
          <div className="cart-actions-row">
            <button
              className="cart-clear-btn"
              onClick={() => {
                clearCart()
              }}
            >
              <Trash2 size={16} />
              <span>Sepeti Temizle</span>
            </button>

            <Link to="/products" className="cart-continue-btn">
              <ArrowLeft size={16} />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>
        </div>

        {/* SAĞ SÜTUN: Sipariş Özeti Kartı */}
        <aside className="cart-summary-card">
          <h3 className="cart-summary-title">Sipariş Özeti</h3>

          <div className="cart-summary-row">
            <span className="cart-summary-label">Ara Toplam</span>
            <span className="cart-summary-value">{formatPrice(cartTotal)}</span>
          </div>

          <div className="cart-summary-row">
            <span className="cart-summary-label">Kargo</span>
            <span className="cart-summary-value" style={{ color: '#16a34a', fontWeight: 600 }}>Ücretsiz</span>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-total-row">
            <span className="cart-total-label">Toplam Tutar</span>
            <span className="cart-total-value">{formatPrice(cartTotal)}</span>
          </div>

          {/* Ödemeye Geç Butonu */}
          <Link to="/checkout" className="cart-checkout-btn">
            <span>Ödemeye Geç</span>
            <ArrowRight size={18} />
          </Link>

          {/* Güvenlik Notu */}
          <div className="cart-security-note">
            <ShieldCheck size={18} color="#2563eb" />
            <span>256-Bit SSL Güvenli Alışveriş</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// 🎨 Stiller
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
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cartItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  },
  imageLink: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
    textDecoration: 'none',
    lineHeight: '1.3',
  },
  itemUnitPrice: {
    fontSize: '13px',
    color: '#64748b',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  qtyBtn: {
    width: '32px',
    height: '34px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#334155',
  },
  qtyText: {
    width: '32px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
  },
  linePriceBox: {
    minWidth: '110px',
    textAlign: 'right',
  },
  linePrice: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartActionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
  },
  clearCartBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'transparent',
    border: '1px solid #fecaca',
    color: '#ef4444',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  continueLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontSize: '14px',
  },
  summaryValue: {
    fontSize: '15px',
    color: '#0f172a',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '16px 0',
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  totalValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#2563eb',
  },
  checkoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.3)',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#64748b',
  },
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
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 10px 0',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
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
  centerBox: {
    padding: '120px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
