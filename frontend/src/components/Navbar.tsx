import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search, User as UserIcon, LogOut, ShieldCheck, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <ShoppingBag size={22} color="#ffffff" />
          </div>
          <span style={styles.logoText}>E-Ticaret</span>
        </Link>

        {/* Arama Çubuğu */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Ürün, kategori veya marka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        {/* Menü Linkleri & Kullanıcı Durumu */}
        <nav style={styles.navActions}>
          <Link to="/products" style={styles.navLink}>
            Ürünler
          </Link>

          {/* Sepet Butonu */}
          <Link to="/cart" style={styles.cartButton}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={20} color="#334155" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
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
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span style={styles.cartText}>Sepetim</span>
          </Link>

          {/* Giriş Durumuna Göre Değişen Alan */}
          {user ? (
            <div style={styles.userMenu}>
              {/* Siparişlerim */}
              <Link to="/orders" style={styles.ordersLink} title="Siparişlerim">
                <Package size={18} color="#475569" />
                <span>Siparişlerim</span>
              </Link>

              {/* Admin Paneli Butonu (Yalnızca ADMIN kullanıcılar için) */}
              {isAdmin && (
                <Link to="/admin" style={styles.adminBadge} title="Yönetici Paneli">
                  <ShieldCheck size={16} color="#059669" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Kullanıcı Adı / Profil Linki */}
              <Link to="/profile" style={styles.userNameBadge} title="Profilimi Görüntüle">
                <UserIcon size={16} color="#2563eb" />
                <span style={styles.userName}>{user.name}</span>
              </Link>

              {/* Çıkış Yap Butonu */}
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
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
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