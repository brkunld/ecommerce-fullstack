// frontend/src/pages/ProductsPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den gelen başlangıç filtreleri
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("categoryId") || "";

  // State'ler
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch);
  const [sortOption, setSortOption] = useState<string>("newest"); // 'newest' | 'price-asc' | 'price-desc'
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Kategorileri Çekme
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // TODO 1: api.get('/categories') ile kategorileri çek
        const res = await api.get("/categories");
        setCategories(res.data.data.categories);
      } catch (err) {
        console.error("Kategoriler alınamadı:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Filtreler veya Sayfa Değiştiğinde Ürünleri Çekme
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Sıralama parametrelerini ayarla
        let sortBy = "createdAt";
        let sortOrder = "desc";

        if (sortOption === "price-asc") {
          sortBy = "price";
          sortOrder = "asc";
        } else if (sortOption === "price-desc") {
          sortBy = "price";
          sortOrder = "desc";
        }

        // Query parametrelerini hazırla
        const params: any = {
          page,
          limit: 8,
          sortBy,
          sortOrder,
        };

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory) params.categoryId = selectedCategory;

        // TODO 2: api.get('/products', { params }) ile ürünleri çek
        const res = await api.get("/products", { params });
        // setProducts(...) içine aktar (res.data.data.products)
        setProducts(res.data.data.products);
        // setTotalPages(...) içine aktar (res.data.data.pagination.totalPages)
        setTotalPages(res.data.data.pagination.totalPages);
      } catch (err) {
        console.error("Ürünler getirilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, sortOption, page]);

  // URL parametreleri her değiştiğinde (örn: Navbar'dan arama yapıldığında) state'leri senkronize et
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    const currentCategory = searchParams.get("categoryId") || "";
    setSearchTerm(currentSearch);
    setSelectedCategory(currentCategory);
    setPage(1);
  }, [searchParams]);

  // Arama formu submit olduğunda
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedCategory) params.categoryId = selectedCategory;
    setSearchParams(params);
  };

  // Kategori seçildiğinde
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (catId) params.categoryId = catId;
    setSearchParams(params);
  };

  return (
    <div style={styles.container}>
      {/* Sayfa Başlığı ve Açıklama */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Ürün Kataloğu</h1>
        <p style={styles.pageSubtitle}>
          Tüm kategorilerdeki en yeni ve kaliteli ürünleri keşfedin
        </p>
      </div>

      {/* Kontrol Barı (Arama ve Sıralama) */}
      <div style={styles.controlsBar}>
        <form onSubmit={handleSearchSubmit} style={styles.searchBox}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Ürün adı veya açıklama ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        <div style={styles.sortBox}>
          <label style={styles.sortLabel}>Sırala:</label>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            style={styles.select}
          >
            <option value="newest">En Yeniler</option>
            <option value="price-asc">Fiyata Göre (Artan)</option>
            <option value="price-desc">Fiyata Göre (Azalan)</option>
          </select>
        </div>
      </div>

      {/* Ana İçerik: Sol Sidebar (Kategoriler) + Sağ Ürün Grid'i */}
      <div style={styles.mainLayout}>
        {/* Sol Filtre Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <Filter size={18} color="#2563eb" />
            <h3 style={styles.sidebarTitle}>Kategoriler</h3>
          </div>

          <div style={styles.categoryList}>
            <button
              onClick={() => handleCategorySelect("")}
              style={{
                ...styles.categoryBtn,
                backgroundColor:
                  selectedCategory === "" ? "#eff6ff" : "transparent",
                color: selectedCategory === "" ? "#2563eb" : "#475569",
                fontWeight: selectedCategory === "" ? 700 : 500,
              }}
            >
              <span>Tüm Ürünler</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  ...styles.categoryBtn,
                  backgroundColor:
                    selectedCategory === cat.id ? "#eff6ff" : "transparent",
                  color: selectedCategory === cat.id ? "#2563eb" : "#475569",
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                }}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Sağ: Ürünler Listesi */}
        <div style={styles.productsArea}>
          {loading ? (
            <div style={styles.centerBox}>
              <Loader2
                size={36}
                color="#2563eb"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <p style={{ marginTop: "12px", color: "#64748b" }}>
                Ürünler getiriliyor...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.centerBox}>
              <PackageOpen size={48} color="#94a3b8" />
              <h3 style={{ margin: "16px 0 6px 0", color: "#0f172a" }}>
                Ürün Bulunamadı
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Aradığınız kriterlere uygun ürün bulunamadı. Filtreleri
                temizleyip tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <>
              <div style={styles.productsGrid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Sayfalama (Pagination) */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    style={{
                      ...styles.pageBtn,
                      opacity: page <= 1 ? 0.5 : 1,
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={18} />
                    <span>Önceki</span>
                  </button>

                  <span style={styles.pageInfo}>
                    Sayfa {page} / {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                      ...styles.pageBtn,
                      opacity: page >= totalPages ? 0.5 : 1,
                      cursor: page >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>Sonraki</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 🎨 Stiller
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "36px 24px 64px 24px",
  },
  header: {
    marginBottom: "28px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  controlsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "28px",
  },
  searchBox: {
    position: "relative",
    flex: 1,
    maxWidth: "450px",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px 10px 38px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
  sortBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sortLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#475569",
  },
  select: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    outline: "none",
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "32px",
    alignItems: "start",
  },
  sidebar: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "20px",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  sidebarTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  categoryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    textAlign: "left",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  productsArea: {
    minHeight: "400px",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },
  centerBox: {
    padding: "80px 0",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    marginTop: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    transition: "background-color 0.2s",
  },
  pageInfo: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
  },
};
