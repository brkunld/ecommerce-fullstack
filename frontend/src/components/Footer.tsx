// frontend/src/components/Footer.tsx
import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="footer-container" style={styles.container}>
        <div className="footer-top-section">
          <div style={styles.brand}>
            <div style={styles.logo}>
              <ShoppingBag size={20} color="#ffffff" />
              <span style={styles.logoText}>E-Ticaret</span>
            </div>
            <p className="footer-desc" style={styles.desc}>
              Modern, güvenli ve hızlı tam kapsamlı e-ticaret platformu.
            </p>
          </div>

          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Alışveriş</h4>
            <Link to="/products" style={styles.link}>Tüm Ürünler</Link>
            <Link to="/cart" style={styles.link}>Sepetim</Link>
          </div>

          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Hesap</h4>
            <Link to="/login" style={styles.link}>Giriş Yap</Link>
            <Link to="/register" style={styles.link}>Kayıt Ol</Link>
            <Link to="/orders" style={styles.link}>Siparişlerim</Link>
          </div>
        </div>

        <div className="footer-bottom-section">
          <p style={styles.copy}>
            © {new Date().getFullYear()} E-Ticaret Platformu. Tüm hakları saklıdır.
          </p>
          <p style={styles.madeWith}>
            <span>Made with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>React + Express</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    marginTop: 'auto',
    borderTop: '1px solid #1e293b',
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '48px 24px 24px 24px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
  },
  desc: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#64748b',
    maxWidth: '320px',
    margin: 0,
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  colTitle: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s',
  },
  copy: {
    margin: 0,
  },
  madeWith: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};