// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form State'leri
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 FORM GÖNDERME MANTIĞI (Burayı sen dolduracaksın)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // TODO 1: api.post('/auth/register', { name, email, password, phone, address }) ile istek at
      const res = await api.post('/auth/register', { name, email, password, phone, address });
      // TODO 2: Gelen token ve user bilgisini al
      const { token, user } = res.data.data;
      // TODO 3: login(token, user) ile oturum aç
      login(token, user);
      // TODO 4: navigate('/') ile ana sayfaya yönlendir
      navigate('/');
    } catch (err: any) {
      // TODO 5: Backend'den dönen hata mesajını yakala ve setError'a ver
      setError(err.response?.data?.message || 'Kayıt yapılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="auth-card" style={styles.card}>
        {/* Başlık ve İkon */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <UserPlus size={28} color="#2563eb" />
          </div>
          <h1 style={styles.title}>Kayıt Ol</h1>
          <p style={styles.subtitle}>Yeni bir hesap oluşturarak ayrıcalıklı alışverişe başlayın</p>
        </div>

        {/* Hata Bildirim Kutusu */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} color="#dc2626" style={{ minWidth: 18 }} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Ad Soyad */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ad Soyad *</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="text"
                required
                placeholder="Ahmet Yılmaz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* E-Posta */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-Posta Adresi *</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Şifre */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre * (En az 6 karakter)</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Telefon (Opsiyonel) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Telefon (İsteğe bağlı)</label>
            <div style={styles.inputWrapper}>
              <Phone size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="tel"
                placeholder="+90 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Adres (Opsiyonel) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Teslimat Adresi (İsteğe bağlı)</label>
            <div style={styles.inputWrapper}>
              <MapPin size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Kadıköy, İstanbul"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Kayıt Ol Butonu */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} style={styles.spinner} />
                <span>Hesap Oluşturuluyor...</span>
              </>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        {/* Giriş Yap Linki */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Zaten bir hesabınız var mı?{' '}
            <Link to="/login" style={styles.loginLink}>
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// 🎨 Stiller
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    backgroundColor: '#f8fafc',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    backgroundColor: '#eff6ff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    marginBottom: '20px',
  },
  errorText: {
    fontSize: '13px',
    color: '#b91c1c',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  submitButton: {
    marginTop: '8px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px',
  },
  footerText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  loginLink: {
    color: '#2563eb',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
