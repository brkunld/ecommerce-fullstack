import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search, User as UserIcon, LogOut, ShieldCheck, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // URL'deki arama parametresini navbar kutusuyla senkronize et
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null) {
      setSearchTerm(q);
    } else if (location.pathname !== '/products') {
      setSearchTerm('');
    }
  }, [location.search, location.pathname]);

  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Ekran büyütüldüğünde (masaüstü genişliğine geçince) mobil menüyü otomatik kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header style={styles.header}>
      <div className="navbar-container" style={{ position: 'relative' }}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <ShoppingBag size={22} color="#ffffff" />
          </div>
          <span style={styles.logoText}>E-Ticaret</span>
        </Link>

        {/* Arama Çubuğu (Desktop) */}
        <form onSubmit={handleSearch} className="navbar-search-form" style={styles.searchForm}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Ürün, kategori veya marka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        {/* Menü Linkleri & Kullanıcı Durumu (Desktop) */}
        <nav className="navbar-actions" style={styles.navActions}>
          <Link to="/products" style={styles.navLink}>
            Ürünler
          </Link>

          {/* Sepet Butonu */}
          <Link to="/cart" style={styles.cartButton}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={20} color="#334155" />
              {cartCount > 0 && (
                <span style={styles.cartBadge}>
                  {cartCount}
                </span>
              )}
            </div>
            <span style={styles.cartText}>Sepetim</span>
          </Link>

          {/* Giriş Durumuna Göre Değişen Alan */}
          {user ? (
            <div style={styles.userMenu}>
              <Link to="/orders" style={styles.ordersLink} title="Siparişlerim">
                <Package size={18} color="#475569" />
                <span>Siparişlerim</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" style={styles.adminBadge} title="Yönetici Paneli">
                  <ShieldCheck size={16} color="#059669" />
                  <span>Admin</span>
                </Link>
              )}

              <Link to="/profile" style={styles.userNameBadge} title="Profilimi Görüntüle">
                <UserIcon size={16} color="#2563eb" />
                <span style={styles.userName}>{user.name}</span>
              </Link>

              <button onClick={handleLogout} style={styles.logoutButton} title="Çıkış Yap">
                <LogOut size={18} color="#dc2626" />
                <span>Çıkış</span>
              </button>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginBtn}>
                Giriş Yap
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Kayıt Ol
              </Link>
            </div>
          )}
        </nav>

        {/* Hamburger Butonu (Mobil) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobil sepet ikonu */}
          <Link to="/cart" className="navbar-hamburger" style={{ textDecoration: 'none', position: 'relative' }}>
            <ShoppingCart size={22} color="#334155" />
            {cartCount > 0 && (
              <span style={{ ...styles.cartBadge, top: '-6px', right: '-8px' }}>
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="navbar-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobil Menü */}
        <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Mobil Arama */}
          <form onSubmit={handleSearch} className="mobile-search-form">
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-search-input"
            />
          </form>

          <Link to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            <Package size={18} />
            Ürünler
          </Link>

          <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={18} />
            Sepetim {cartCount > 0 && `(${cartCount})`}
          </Link>

          {user ? (
            <>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <Package size={18} />
                Siparişlerim
              </Link>

              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <UserIcon size={18} />
                {user.name}
              </Link>

              {isAdmin && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <ShieldCheck size={18} />
                  Admin Paneli
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="mobile-nav-link"
                style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', cursor: 'pointer', width: '100%' }}
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                to="/login"
                style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#0f172a',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  searchForm: {
    flex: 1,
    maxWidth: '520px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px 10px 42px',
    fontSize: '14px',
    color: '#0f172a',
    borderRadius: '9999px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'color 0.2s',
  },
  cartButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    transition: 'background-color 0.2s',
  },
  cartText: {
    fontSize: '14px',
  },
  cartBadge: {
    position: 'absolute' as const,
    top: '-8px',
    right: '-10px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  ordersLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#047857',
    backgroundColor: '#d1fae5',
    padding: '4px 8px',
    borderRadius: '6px',
    textDecoration: 'none',
  },
  userNameBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#eff6ff',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1d4ed8',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loginBtn: {
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    backgroundColor: '#eff6ff',
    transition: 'background-color 0.2s',
  },
  registerBtn: {
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    transition: 'background-color 0.2s',
  },
};