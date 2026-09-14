// frontend/src/pages/ProfilePage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Package,
  LogOut,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={styles.centerBox}>
        <h2 style={{ color: '#0f172a', marginBottom: '12px' }}>Giriş Yapılmadı</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Profilinizi görüntülemek için lütfen hesabınıza giriş yapın.
        </p>
        <Link to="/login" style={styles.primaryBtn}>
          Giriş Yap
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page-container profile-page-container">
      {/* Üst Karşılama Alanı */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <UserIcon size={38} color="#ffffff" />
          </div>
          <div>
            <div className="profile-name-row">
              <h1 className="profile-user-name">{user.name}</h1>
              {isAdmin ? (
                <span style={styles.adminBadge}>
                  <ShieldCheck size={14} />
                  <span>Yönetici (Admin)</span>
                </span>
              ) : (
                <span style={styles.customerBadge}>
                  <span>Müşteri Hesabı</span>
                </span>
              )}
            </div>
            <p className="profile-user-email">{user.email}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="profile-logout-btn" title="Oturumu Kapat">
          <LogOut size={16} />
          <span>Çıkış Yap</span>
        </button>
      </div>

      <div className="profile-layout">
        {/* SOL: Profil Bilgileri Kartı */}
        <div className="profile-info-card">
          <h3 className="profile-card-title">Hesap Bilgileri</h3>
          <div className="profile-info-list">
            <div className="profile-info-item">
              <div className="profile-info-icon-box">
                <UserIcon size={18} color="#2563eb" />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Ad Soyad</span>
                <span className="profile-info-value">{user.name}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon-box">
                <Mail size={18} color="#2563eb" />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">E-posta Adresi</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon-box">
                <Phone size={18} color="#2563eb" />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Telefon Numarası</span>
                <span className="profile-info-value">{user.phone || 'Henüz eklenmemiş'}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon-box">
                <MapPin size={18} color="#2563eb" />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Kayıtlı Adres</span>
                <span className="profile-info-value">{user.address || 'Henüz eklenmemiş'}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon-box">
                <Calendar size={18} color="#2563eb" />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Kayıt Tarihi</span>
                <span className="profile-info-value">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: Hızlı Kısayollar ve İşlemler */}
        <div className="profile-side-col">
          {/* Siparişlerim Kısayolu */}
          <Link to="/orders" className="profile-action-card">
            <div style={styles.actionIconBox}>
              <Package size={24} color="#2563eb" />
            </div>
            <div style={styles.actionText}>
              <h4 style={styles.actionTitle}>Siparişlerim</h4>
              <p style={styles.actionDesc}>Geçmiş siparişlerinizi ve kargo durumunu görüntüleyin</p>
            </div>
            <ArrowRight size={20} color="#94a3b8" />
          </Link>

          {/* Alışverişe Devam Et Kısayolu */}
          <Link to="/products" className="profile-action-card">
            <div style={{ ...styles.actionIconBox, backgroundColor: '#f0fdf4' }}>
              <ShoppingBag size={24} color="#16a34a" />
            </div>
            <div style={styles.actionText}>
              <h4 style={styles.actionTitle}>Alışverişe Başla</h4>
              <p style={styles.actionDesc}>Yeni ürünleri ve popüler kategorileri keşfedin</p>
            </div>
            <ArrowRight size={20} color="#94a3b8" />
          </Link>

          {/* Güvenlik & Bilgilendirme Kutusu */}
          <div className="profile-security-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
              <ShieldCheck size={18} color="#2563eb" />
              <span>Hesap Güvenliği</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Hesabınız 256-bit JWT authentication ve güvenli şifreleme algoritmaları ile korunmaktadır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 24px 80px 24px',
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  avatarWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  avatar: {
    width: '68px',
    height: '68px',
    borderRadius: '18px',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.25)',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#047857',
    backgroundColor: '#d1fae5',
    padding: '4px 10px',
    borderRadius: '9999px',
  },
  customerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '9999px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fee2e2',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '32px',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 24px 0',
    paddingBottom: '14px',
    borderBottom: '1px solid #f1f5f9',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  infoIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  actionIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  actionDesc: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.4,
  },
  securityBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '18px 20px',
  },
  centerBox: {
    padding: '120px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 28px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
