// frontend/src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Görseli güvenli şekilde al (JSON parse veya direkt dizi kontrolü)
  let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  try {
    if (Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0];
      }
    }
  } catch {
    // fallback
  }

  // Fiyatı formatla
  const formattedPrice = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(Number(product.price));

  const isOutOfStock = product.stock <= 0;

  return (
    <div style={styles.card}>
      {/* Görsel Alanı */}
      <div style={styles.imageContainer}>
        <img src={imageUrl} alt={product.name} style={styles.image} />
        {isOutOfStock ? (
          <span style={styles.outOfStockBadge}>Tükendi</span>
        ) : product.featured ? (
          <span style={styles.featuredBadge}>Öne Çıkan</span>
        ) : null}
      </div>

      {/* İçerik Alanı */}
      <div style={styles.content}>
        {product.category && (
          <span style={styles.categoryName}>{product.category.name}</span>
        )}
        <h3 style={styles.title} title={product.name}>
          <Link to={`/products/${product.id}`} style={styles.titleLink}>
            {product.name}
          </Link>
        </h3>
        <p style={styles.description}>
          {product.description.length > 65
            ? `${product.description.substring(0, 65)}...`
            : product.description}
        </p>

        {/* Fiyat ve Butonlar */}
        <div style={styles.footer}>
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Fiyat</span>
            <span style={styles.price}>{formattedPrice}</span>
          </div>

          <div style={styles.actions}>
            <Link to={`/products/${product.id}`} style={styles.viewButton} title="İncele">
              <Eye size={18} color="#475569" />
            </Link>
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              disabled={isOutOfStock}
              style={{
                ...styles.cartButton,
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              }}
              title={isOutOfStock ? 'Stokta Yok' : 'Sepete Ekle'}
            >
              <ShoppingCart size={18} color="#ffffff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '65%', // 16:10 orantısı
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  featuredBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '6px',
  },
  content: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  categoryName: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#2563eb',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 6px 0',
    lineHeight: '1.3',
  },
  titleLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
  description: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  cartButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
};
