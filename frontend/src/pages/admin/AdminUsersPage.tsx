// frontend/src/pages/admin/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Eye,
  Loader2,
  X,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface ExtendedUser extends User {
  _count?: {
    orders: number;
  };
}

interface UserDetailOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  _count?: {
    items: number;
  };
}

interface UserDetailData extends User {
  orders: UserDetailOrder[];
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Arama & Filtreleme
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'CUSTOMER'>('ALL');

  // Detay Modalı State'i
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Rol Güncelleme Yükleniyor Durumu
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // 1. Kullanıcıları Çekme (GET /api/admin/users)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users');
      const userList = res.data?.data?.users || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err: any) {
      console.error('Kullanıcılar yüklenemedi:', err);
      setError(err.response?.data?.message || 'Kullanıcı listesi alınamadı.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Kullanıcı Detayını Çekme (GET /api/admin/users/:id)
  const handleOpenDetail = async (userId: string) => {
    try {
      setSelectedUserId(userId);
      setDetailLoading(true);
      const res = await api.get(`/admin/users/${userId}`);
      setDetailUser(res.data?.data?.user || null);
    } catch (err) {
      console.error('Kullanıcı detayı alınamadı:', err);
      alert('Kullanıcı bilgileri ve sipariş geçmişi yüklenemedi.');
      setSelectedUserId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // 3. Kullanıcı Rolü Değiştirme (PATCH /api/admin/users/:id/role)
  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

    if (currentUser?.id === userId && newRole !== 'ADMIN') {
      alert('Kendi admin yetkinizi kaldıramazsınız.');
      return;
    }

    const confirmMsg = `Kullanıcının rolünü "${newRole}" olarak değiştirmek istediğinize emin misiniz?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdatingRoleId(userId);

      // Optimistic UI
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );

      if (detailUser && detailUser.id === userId) {
        setDetailUser((prev) => (prev ? { ...prev, role: newRole as any } : null));
      }

      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
    } catch (err: any) {
      console.error('Rol güncellenemedi:', err);
      alert(err.response?.data?.message || 'Rol güncellenirken bir hata oluştu.');
      fetchUsers();
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Tarih ve Fiyat Biçimlendirme
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

  // Filtrelenmiş Kullanıcılar
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term));

    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Üst Başlık */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Kullanıcı Yönetimi</h1>
            <p style={styles.pageSubtitle}>
              Toplam {users.length} adet kayıtlı kullanıcı mevcut. Yetkilendirme yapabilir ve kullanıcı siparişlerini inceleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Rol Filtre Sekmeleri */}
        <div className="admin-users-role-tabs" style={styles.roleTabs}>
          {[
            { key: 'ALL', label: 'Tüm Kullanıcılar', count: users.length },
            { key: 'ADMIN', label: 'Yöneticiler (Admin)', count: adminCount },
            { key: 'CUSTOMER', label: 'Müşteriler', count: customerCount },
          ].map((tab) => {
            const isSelected = roleFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key as any)}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#64748b',
                  border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    ...styles.tabBadge,
                    backgroundColor: isSelected ? '#334155' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Arama Çubuğu */}
        <div className="admin-users-filter-bar" style={styles.filterBar}>
          <div className="admin-users-search-box" style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="İsim, e-posta veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={styles.clearBtn}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Kullanıcı Tablosu */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.centerBox}>
              <Loader2 size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Kullanıcılar yükleniyor...</p>
            </div>
          ) : error ? (
            <div style={styles.centerBox}>
              <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchUsers} style={styles.secondaryBtn}>
                Tekrar Dene
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.centerBox}>
              <Users size={48} color="#cbd5e1" />
              <h3 style={{ margin: '16px 0 6px 0', color: '#0f172a', fontWeight: 700 }}>Kullanıcı Bulunamadı</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {searchTerm || roleFilter !== 'ALL'
                  ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.'
                  : 'Sistemde henüz kayıtlı kullanıcı bulunmuyor.'}
              </p>
            </div>
          ) : (
            <>
              {/* MASAÜSTÜ TABLO GÖRÜNÜMÜ */}
              <div className="admin-users-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Kullanıcı Adı</th>
                      <th style={styles.th}>E-posta</th>
                      <th style={styles.th}>Kayıt Tarihi</th>
                      <th style={styles.th}>Siparişler</th>
                      <th style={styles.th}>Rol</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isAdmin = u.role === 'ADMIN';
                      const isCurrent = currentUser?.id === u.id;

                      return (
                        <tr key={u.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  ...styles.avatar,
                                  backgroundColor: isAdmin ? '#eff6ff' : '#f8fafc',
                                  color: isAdmin ? '#2563eb' : '#475569',
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                  {u.name}
                                  {isCurrent && (
                                    <span style={styles.selfBadge}>Siz</span>
                                  )}
                                </div>
                                {u.phone && (
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>{u.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#334155', fontSize: '13px' }}>{u.email}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#64748b', fontSize: '13px' }}>
                              {formatDate(u.createdAt)}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShoppingBag size={14} color="#64748b" />
                              <span style={styles.orderBadge}>
                                {u._count?.orders ?? 0} sipariş
                              </span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.roleBadge,
                                backgroundColor: isAdmin ? '#f5f3ff' : '#f1f5f9',
                                color: isAdmin ? '#7c3aed' : '#475569',
                                borderColor: isAdmin ? '#ddd6fe' : '#e2e8f0',
                              }}
                            >
                              {isAdmin ? <ShieldCheck size={13} /> : <Shield size={13} />}
                              <span>{isAdmin ? 'Admin' : 'Müşteri'}</span>
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              {/* Rol Değiştir Butonu */}
                              <button
                                onClick={() => handleRoleChange(u.id, u.role)}
                                disabled={updatingRoleId === u.id || (isCurrent && isAdmin)}
                                style={{
                                  ...styles.actionBtn,
                                  opacity: isCurrent && isAdmin ? 0.4 : 1,
                                  cursor: isCurrent && isAdmin ? 'not-allowed' : 'pointer',
                                }}
                                title={
                                  isCurrent && isAdmin
                                    ? 'Kendi admin yetkinizi kaldıramazsınız'
                                    : isAdmin
                                    ? 'Müşteri Yap'
                                    : 'Admin Yetkisi Ver'
                                }
                              >
                                {updatingRoleId === u.id ? (
                                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <span>{isAdmin ? 'Yetkiyi Kaldır' : 'Admin Yap'}</span>
                                )}
                              </button>

                              {/* Detay Butonu */}
                              <button
                                onClick={() => handleOpenDetail(u.id)}
                                style={styles.iconBtn}
                                title="Kullanıcı Detayları ve Siparişleri"
                              >
                                <Eye size={16} color="#2563eb" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBİL KART LİSTESİ (Sağa sola kaydırma gerektirmez) */}
              <div className="admin-users-mobile-list">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <div key={u.id} className="admin-user-mobile-card">
                      {/* Kart Üst: Avatar + İsim + Rol + Detay İkonu */}
                      <div className="admin-user-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              ...styles.avatar,
                              backgroundColor: isAdmin ? '#eff6ff' : '#f8fafc',
                              color: isAdmin ? '#2563eb' : '#475569',
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                              {u.name}
                              {isCurrent && <span style={styles.selfBadge}>Siz</span>}
                            </div>
                            <span
                              style={{
                                ...styles.roleBadge,
                                backgroundColor: isAdmin ? '#f5f3ff' : '#f1f5f9',
                                color: isAdmin ? '#7c3aed' : '#475569',
                                borderColor: isAdmin ? '#ddd6fe' : '#e2e8f0',
                                marginTop: '4px',
                              }}
                            >
                              {isAdmin ? <ShieldCheck size={12} /> : <Shield size={12} />}
                              <span>{isAdmin ? 'Admin' : 'Müşteri'}</span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenDetail(u.id)}
                          className="admin-card-icon-btn"
                          title="Detaylar"
                        >
                          <Eye size={18} color="#2563eb" />
                        </button>
                      </div>

                      {/* Kart Orta: İletişim ve Detaylar */}
                      <div className="admin-user-card-body">
                        <div className="admin-user-card-row">
                          <Mail size={14} color="#64748b" />
                          <span className="admin-user-card-email">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="admin-user-card-row">
                            <Phone size={14} color="#64748b" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        <div className="admin-user-card-meta-row">
                          <div className="admin-user-card-row">
                            <Calendar size={14} color="#64748b" />
                            <span>Kayıt: {formatDate(u.createdAt)}</span>
                          </div>
                          <div className="admin-user-card-row">
                            <ShoppingBag size={14} color="#64748b" />
                            <span style={styles.orderBadge}>{u._count?.orders ?? 0} sipariş</span>
                          </div>
                        </div>
                      </div>

                      {/* Kart Alt: İşlem Butonları */}
                      <div className="admin-user-card-actions">
                        <button
                          onClick={() => handleOpenDetail(u.id)}
                          className="admin-user-view-btn"
                        >
                          <Eye size={15} />
                          <span>Profili & Siparişleri Gör</span>
                        </button>

                        <button
                          onClick={() => handleRoleChange(u.id, u.role)}
                          disabled={updatingRoleId === u.id || (isCurrent && isAdmin)}
                          className={`admin-user-role-btn ${isAdmin ? 'demote' : 'promote'}`}
                          style={{
                            opacity: isCurrent && isAdmin ? 0.4 : 1,
                            cursor: isCurrent && isAdmin ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {updatingRoleId === u.id ? (
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <span>{isAdmin ? 'Yetkiyi Kaldır' : 'Admin Yetkisi Ver'}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KULLANICI DETAY MODALI */}
      {/* ========================================================================= */}
      {selectedUserId && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '640px' }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Kullanıcı Profili & Sipariş Geçmişi</h2>
              <button onClick={() => setSelectedUserId(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div style={styles.centerBox}>
                <Loader2 size={36} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Bilgiler alınıyor...</p>
              </div>
            ) : detailUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Profil Kartı */}
                <div style={styles.profileBox}>
                  <div style={styles.profileHeader}>
                    <div style={styles.profileAvatar}>
                      {detailUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                        {detailUser.name}
                      </h3>
                      <span
                        style={{
                          ...styles.roleBadge,
                          backgroundColor: detailUser.role === 'ADMIN' ? '#f5f3ff' : '#f1f5f9',
                          color: detailUser.role === 'ADMIN' ? '#7c3aed' : '#475569',
                          borderColor: detailUser.role === 'ADMIN' ? '#ddd6fe' : '#e2e8f0',
                        }}
                      >
                        {detailUser.role === 'ADMIN' ? 'Yönetici (Admin)' : 'Müşteri'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.profileDetailsGrid}>
                    <div style={styles.profileDetailItem}>
                      <Mail size={15} color="#64748b" />
                      <span>{detailUser.email}</span>
                    </div>
                    <div style={styles.profileDetailItem}>
                      <Phone size={15} color="#64748b" />
                      <span>{detailUser.phone || 'Telefon eklenmemiş'}</span>
                    </div>
                    <div style={styles.profileDetailItem}>
                      <Calendar size={15} color="#64748b" />
                      <span>Kayıt: {formatDate(detailUser.createdAt)}</span>
                    </div>
                    <div style={styles.profileDetailItem}>
                      <MapPin size={15} color="#64748b" />
                      <span>{detailUser.address || 'Adres eklenmemiş'}</span>
                    </div>
                  </div>
                </div>

                {/* Kullanıcının Sipariş Geçmişi */}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    Sipariş Geçmişi ({detailUser.orders?.length || 0})
                  </h4>

                  {detailUser.orders && detailUser.orders.length > 0 ? (
                    <>
                      {/* Masaüstü Sipariş Tablosu */}
                      <div className="admin-modal-table-desktop" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Sipariş No</th>
                              <th style={styles.th}>Tarih</th>
                              <th style={styles.th}>Tutar</th>
                              <th style={styles.th}>Durum</th>
                              <th style={{ ...styles.th, textAlign: 'right' }}>İncele</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailUser.orders.map((o) => (
                              <tr key={o.id} style={styles.tr}>
                                <td style={styles.td}>
                                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                                    {o.orderNumber}
                                  </span>
                                </td>
                                <td style={styles.td}>{formatDate(o.createdAt)}</td>
                                <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>
                                  {formatPrice(o.totalAmount)}
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.orderStatusPill}>{o.status}</span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <Link
                                    to={`/orders/${o.id}`}
                                    style={styles.orderLinkBtn}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <span>Görüntüle</span>
                                    <ExternalLink size={12} />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobil Sipariş Kartları (Kaydırma gerektirmez) */}
                      <div className="admin-modal-orders-mobile">
                        {detailUser.orders.map((o) => (
                          <div key={o.id} className="admin-modal-order-card">
                            <div className="admin-modal-order-card-header">
                              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                                #{o.orderNumber}
                              </span>
                              <span style={styles.orderStatusPill}>{o.status}</span>
                            </div>
                            <div className="admin-modal-order-card-body">
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{formatDate(o.createdAt)}</span>
                              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{formatPrice(o.totalAmount)}</span>
                            </div>
                            <Link
                              to={`/orders/${o.id}`}
                              className="admin-modal-order-link"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span>Siparişi Görüntüle</span>
                              <ExternalLink size={14} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={styles.emptyOrdersBox}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                        Bu kullanıcının henüz verilmiş bir siparişi bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// 🎨 Stiller (CSS-in-JS)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  roleTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  searchBox: {
    flex: 1,
    maxWidth: '440px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0 14px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '12px 0',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  clearBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '14px 20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '13px',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '15px',
    flexShrink: 0,
    border: '1px solid #e2e8f0',
  },
  selfBadge: {
    marginLeft: '6px',
    padding: '2px 6px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: 700,
    borderRadius: '4px',
  },
  orderBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 700,
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  actionBtn: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconBtn: {
    width: '34px',
    height: '34px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748b',
  },
  profileBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    padding: '18px',
    border: '1px solid #e2e8f0',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  profileAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    fontSize: '13px',
    color: '#475569',
  },
  profileDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  orderStatusPill: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#334155',
  },
  orderLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: 600,
  },
  emptyOrdersBox: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px dashed #e2e8f0',
  },
  centerBox: {
    padding: '80px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
