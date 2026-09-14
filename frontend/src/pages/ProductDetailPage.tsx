// frontend/src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Loader2, PackageOpen } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      alert('Sepete ürün eklemek için lütfen giriş yapınız.');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
      alert(`${quantity} adet "${product.name}" sepete eklendi! 🛒`);
    } catch {
      alert('Sepete eklenirken bir hata oluştu.');
    } finally {
      setAddingToCart(false);
    }
  };

  // 🚀 BACKEND'DEN ÜRÜN DETAYINI ÇEKME (Burayı sen dolduracaksın)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // TODO 1: api.get('/products/' + id) çağır
        const res = await api.get(`/products/${id}`);
        const prod = res.data.data.product;
        setProduct(prod);

        // TODO 2: Ürünün ilk görselini seçili yap:
        if (prod.images && prod.images.length > 0) {
         setSelectedImage(Array.isArray(prod.images) ? prod.images[0] : JSON.parse(prod.images)[0]);
        }

      } catch (err: any) {
        console.error('Ürün yüklenemedi:', err);
        setError('Ürün bulunamadı veya bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Görselleri güvenli liste haline getirme
  const getImagesList = (): string[] => {
    if (!product || !product.images) return [];
    try {
      if (Array.isArray(product.images)) return product.images;
      if (typeof product.images === 'string') return JSON.parse(product.images);
    } catch {
      return [];
    }
    return [];
  };

  const imagesList = getImagesList();

  // Fiyat formatı
  const formattedPrice = product
    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(product.price))
    : '₺0,00';

  const isOutOfStock = (product?.stock ?? 0) <= 0;

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Ürün detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.centerBox}>
        <PackageOpen size={48} color="#94a3b8" />
        <h2 style={{ margin: '16px 0 8px 0', color: '#0f172a' }}>Ürün Bulunamadı</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>İncelemek istediğiniz ürün artık mevcut olmayabilir.</p>
        <Link to="/products" style={styles.backButton}>
          <ArrowLeft size={18} />
          <span>Ürünlere Geri Dön</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={styles.container}>
      {/* Breadcrumb Navigasyon */}
      <nav className="product-breadcrumb" style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Ana Sayfa</Link>
        <span style={styles.breadcrumbDivider}>/</span>
        <Link to="/products" style={styles.breadcrumbLink}>Ürünler</Link>
        {product.category && (
          <>
            <span style={styles.breadcrumbDivider}>/</span>
            <Link to={`/products?categoryId=${product.category.id}`} style={styles.breadcrumbLink}>
              {product.category.name}
            </Link>
          </>
        )}
        <span style={styles.breadcrumbDivider}>/</span>
        <span style={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Ana Detay Düzeni */}
      <div className="product-detail-layout" style={styles.detailLayout}>
        {/* SOL: Görsel Galerisi */}
        <div style={styles.galleryArea}>
          <div style={styles.mainImageBox}>
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
              alt={product.name}
              style={styles.mainImage}
            />
            {isOutOfStock && <span style={styles.outOfStockBadge}>Tükendi</span>}
          </div>

          {/* Küçük Görseller (Varsa) */}
          {imagesList.length > 1 && (
            <div style={styles.thumbnailsRow}>
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    ...styles.thumbnailBtn,
                    border: selectedImage === img ? '2px solid #2563eb' : '2px solid transparent',
                  }}
                >
                  <img src={img} alt="" style={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: Bilgiler ve Sepet Butonları */}
        <div style={styles.infoArea}>
          {product.category && (
            <span style={styles.categoryBadge}>{product.category.name}</span>
          )}

          <h1 className="product-title" style={styles.productTitle}>{product.name}</h1>

          {/* Fiyat Alanı */}
          <div style={styles.priceSection}>
            <span className="product-price-value" style={styles.priceValue}>{formattedPrice}</span>
            <span style={styles.vatText}>KDV dahildir</span>
          </div>

          {/* Stok Durumu */}
          <div style={styles.stockStatus}>
            <span style={{
              ...styles.stockDot,
              backgroundColor: isOutOfStock ? '#ef4444' : '#10b981',
            }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: isOutOfStock ? '#ef4444' : '#059669' }}>
              {isOutOfStock ? 'Stokta kalmadı' : `Stokta var (${product.stock} adet)`}
            </span>
          </div>

          {/* Açıklama */}
          <div style={styles.descSection}>
            <h3 style={styles.descHeading}>Ürün Açıklaması</h3>
            <p style={styles.descText}>{product.description}</p>
          </div>

          {/* Miktar ve Sepete Ekle Butonları */}
          <div className="product-purchase-box" style={styles.purchaseBox}>
            <div style={styles.quantitySelector}>
              <button
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}
              >
                -
              </button>
              <span style={styles.qtyNumber}>{quantity}</span>
              <button
                disabled={quantity >= product.stock || isOutOfStock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                style={styles.qtyBtn}
              >
                +
              </button>
            </div>

            <button
              disabled={isOutOfStock || addingToCart}
              onClick={handleAddToCart}
              style={{
                ...styles.addToCartBtn,
                opacity: isOutOfStock || addingToCart ? 0.5 : 1,
                cursor: isOutOfStock || addingToCart ? 'not-allowed' : 'pointer',
              }}
            >
              <ShoppingCart size={20} />
              <span>{addingToCart ? 'Ekleniyor...' : isOutOfStock ? 'Stokta Yok' : 'Sepete Ekle'}</span>
            </button>
          </div>

          {/* 3'lü Güvence Rozetleri */}
          <div className="product-guarantee-grid" style={styles.guaranteeGrid}>
            <div style={styles.guaranteeItem}>
              <Truck size={20} color="#2563eb" />
              <div>
                <h5 style={styles.gTitle}>Hızlı Kargo</h5>
                <p style={styles.gDesc}>24 saatte kargoda</p>
              </div>
            </div>
            <div style={styles.guaranteeItem}>
              <RotateCcw size={20} color="#2563eb" />
              <div>
                <h5 style={styles.gTitle}>14 Gün İade</h5>
                <p style={styles.gDesc}>Koşulsuz iade hakkı</p>
              </div>
            </div>
            <div style={styles.guaranteeItem}>
              <ShieldCheck size={20} color="#2563eb" />
              <div>
                <h5 style={styles.gTitle}>Orijinal Ürün</h5>
                <p style={styles.gDesc}>%100 garanti</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '24px 24px 80px 24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '32px',
  },
  breadcrumbLink: {
    color: '#64748b',
    textDecoration: 'none',
  },
  breadcrumbDivider: {
    color: '#cbd5e1',
  },
  breadcrumbCurrent: {
    color: '#0f172a',
    fontWeight: 600,
  },
  detailLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    gap: '48px',
    alignItems: 'start',
  },
  galleryArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mainImageBox: {
    position: 'relative',
    width: '100%',
    paddingTop: '85%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  mainImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    padding: '6px 12px',
    borderRadius: '8px',
    textTransform: 'uppercase',
  },
  thumbnailsRow: {
    display: 'flex',
    gap: '12px',
  },
  thumbnailBtn: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    overflow: 'hidden',
    padding: 0,
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryBadge: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 10px',
    borderRadius: '6px',
    alignSelf: 'flex-start',
    marginBottom: '12px',
  },
  productTitle: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '16px',
  },
  priceValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#0f172a',
  },
  vatText: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  stockStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  stockDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  descSection: {
    padding: '24px 0',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '28px',
  },
  descHeading: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  descText: {
    fontSize: '15px',
    color: '#475569',
    lineHeight: '1.6',
    margin: 0,
  },
  purchaseBox: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
  },
  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  qtyBtn: {
    width: '42px',
    height: '48px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#334155',
  },
  qtyNumber: {
    width: '42px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
  },
  addToCartBtn: {
    flex: 1,
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.25)',
  },
  guaranteeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  guaranteeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  gTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  gDesc: {
    fontSize: '12px',
    color: '#64748b',
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
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
};
