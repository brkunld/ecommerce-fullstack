// frontend/src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Sparkles,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 BACKEND'DEN VERİLERİ ÇEKME FONKSİYONU
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // TODO 1: api.get('/categories') ile kategorileri çek
        const catRes = await api.get("/categories");
        const categories = catRes.data.data.categories;
        setCategories(categories);
        // setCategories(...) içine aktar (catRes.data.data.categories)

        // TODO 2: api.get('/products?featured=true&limit=8') ile öne çıkan ürünleri çek
        const prodRes = await api.get('/products?featured=true&limit=8');
        // setFeaturedProducts(...) içine aktar (prodRes.data.data.products)
        let featuredProducts = prodRes.data.data.products
        setFeaturedProducts(featuredProducts)
      } catch (err: any) {
        console.error("Ana sayfa verileri yüklenemedi:", err);
        setError("Veriler yüklenirken bir sorun oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div style={styles.container}>
      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={16} color="#2563eb" />
            <span>Yeni Sezon Koleksiyonu</span>
          </div>
          <h1 style={styles.heroTitle}>
            Tarzını Yansıt, <br />
            <span style={{ color: "#2563eb" }}>En İyisini</span> Keşfet.
          </h1>
          <p style={styles.heroDesc}>
            Elektronikten modaya, ev yaşamından spora binlerce kaliteli ürün en
            uygun fiyatlar ve hızlı teslimat avantajıyla sizleri bekliyor.
          </p>
          <div style={styles.heroActions}>
            <Link to="/products" style={styles.primaryButton}>
              <span>Alışverişe Başla</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3'lü Güven Rozetleri */}
        <div style={styles.featuresBar}>
          <div style={styles.featureItem}>
            <div style={styles.featureIconBox}>
              <Truck size={22} color="#2563eb" />
            </div>
            <div>
              <h4 style={styles.featureTitle}>Hızlı Teslimat</h4>
              <p style={styles.featureDesc}>Aynı gün kargo imkanı</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIconBox}>
              <ShieldCheck size={22} color="#2563eb" />
            </div>
            <div>
              <h4 style={styles.featureTitle}>Güvenli Ödeme</h4>
              <p style={styles.featureDesc}>256-bit SSL koruması</p>
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIconBox}>
              <Headphones size={22} color="#2563eb" />
            </div>
            <div>
              <h4 style={styles.featureTitle}>7/24 Destek</h4>
              <p style={styles.featureDesc}>Kesintisiz müşteri hizmetleri</p>
            </div>
          </div>
        </div>
      </section>

      {/* Yükleniyor / Hata Durumu */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <Loader2
            size={36}
            color="#2563eb"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p style={{ marginTop: "12px", color: "#64748b" }}>
            Ürünler yükleniyor...
          </p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p style={{ color: "#dc2626" }}>{error}</p>
        </div>
      ) : (
        <>
          {/* 2. KATEGORİLER VİTRİNİ */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Popüler Kategoriler</h2>
                <p style={styles.sectionSubtitle}>
                  İhtiyacınız olan kategoriyi seçin
                </p>
              </div>
              <Link to="/products" style={styles.viewAllLink}>
                Tümünü Gör →
              </Link>
            </div>

            <div style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  style={styles.categoryCard}
                >
                  <span style={styles.categoryCardTitle}>{cat.name}</span>
                  <span style={styles.categoryCardArrow}>→</span>
                </Link>
              ))}
            </div>
          </section>

          {/* 3. ÖNE ÇIKAN ÜRÜNLER */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Öne Çıkan Ürünler</h2>
                <p style={styles.sectionSubtitle}>
                  En çok tercih edilen popüler modeller
                </p>
              </div>
              <Link to="/products" style={styles.viewAllLink}>
                Tüm Ürünler →
              </Link>
            </div>

            <div style={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 24px 64px 24px",
  },
  heroSection: {
    padding: "64px 0 32px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  heroContent: {
    maxWidth: "720px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    borderRadius: "9999px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
    border: "1px solid #dbeafe",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.15,
    margin: "0 0 16px 0",
  },
  heroDesc: {
    fontSize: "16px",
    color: "#64748b",
    lineHeight: 1.6,
    margin: "0 0 28px 0",
  },
  heroActions: {
    display: "flex",
    gap: "14px",
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.3)",
  },
  featuresBar: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "56px",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
  },
  featureIconBox: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 2px 0",
  },
  featureDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  section: {
    marginTop: "56px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  viewAllLink: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2563eb",
    textDecoration: "none",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    padding: "20px 24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textDecoration: "none",
    color: "#0f172a",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  categoryCardTitle: {
    fontSize: "15px",
    fontWeight: 600,
  },
  categoryCardArrow: {
    color: "#2563eb",
    fontWeight: 700,
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },
  loadingContainer: {
    padding: "80px 0",
    textAlign: "center",
  },
  errorContainer: {
    padding: "40px 0",
    textAlign: "center",
  },
};
