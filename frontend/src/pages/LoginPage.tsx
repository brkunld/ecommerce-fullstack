// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 FORM GÖNDERME MANTIĞI (Burayı seninle dolduracağız)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // TODO 1: api.post('/auth/login', { email, password }) ile backend'e istek at
      const res = await api.post('/auth/login', { email, password });
      
      // TODO 2: Gelen token ve user verisini al (res.data.data.token ve res.data.data.user)
      const { token, user } = res.data.data;
      
      // TODO 3: login(token, user) çağırarak global oturumu başlat
      login(token, user);
      
      // TODO 4: navigate('/') ile ana sayfaya yönlendir
      navigate('/');
    } catch (err: any) {
      // TODO 5: Backend'den dönen hata mesajını yakala ve setError'a aktar
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Başlık ve İkon */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <LogIn size={28} color="#2563eb" />
          </div>
          <h1 style={styles.title}>Giriş Yap</h1>
          <p style={styles.subtitle}>Hesabınıza giriş yaparak alışverişe devam edin</p>
        </div>

        {/* Hata Bildirim Kutusu (Varsa Gösterilir) */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} color="#dc2626" style={{ minWidth: 18 }} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* E-Posta Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-Posta Adresi</label>
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

          {/* Şifre Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Giriş Yap Butonu */}
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
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        {/* Kayıt Ol Linki */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Henüz bir hesabınız yok mu?{' '}
            <Link to="/register" style={styles.registerLink}>
              Hemen Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// 🎨 Temiz, modern ve şık stiller
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#f8fafc',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
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
    gap: '18px',
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
    marginTop: '6px',
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
  registerLink: {
    color: '#2563eb',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
