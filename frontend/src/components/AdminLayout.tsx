// frontend/src/components/AdminLayout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Ürün Yönetimi', path: '/admin/products', icon: <Package size={18} /> },
    { label: 'Kategori Yönetimi', path: '/admin/categories', icon: <FolderTree size={18} /> },
    { label: 'Siparişler', path: '/admin/orders', icon: <ShoppingBag size={18} /> },
    { label: 'Kullanıcılar', path: '/admin/users', icon: <Users size={18} /> },
  ];

  return (
    <div style={styles.wrapper}>
      {/* SOL: Sabit Admin Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.brandIcon}>
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={styles.brandTitle}>Admin Paneli</h2>
            <span style={styles.adminUserText}>{user?.name || 'Yönetici'}</span>
          </div>
        </div>

        {/* Menü Linkleri */}
        <nav style={styles.navList}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Alt Kısım: Mağazaya Dön Butonu */}
        <div style={styles.sidebarFooter}>
          <Link to="/" style={styles.storeLink}>
            <Store size={18} />
            <span>Mağazaya Dön</span>
          </Link>
        </div>
      </aside>

      {/* SAĞ: Sayfa İçerik Alanı */}
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: 'flex',
    minHeight: 'calc(100vh - 70px)',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    marginBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
  },
  brandIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  adminUserText: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  sidebarFooter: {
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  storeLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'background-color 0.2s ease',
  },
  mainContent: {
    flex: 1,
    padding: '32px 36px',
    overflowY: 'auto',
  },
};
