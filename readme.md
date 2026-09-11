# 🛒 E-Ticaret Full-Stack Uygulaması

Modern bir e-ticaret sisteminin temel ihtiyaçlarını karşılamak amacıyla geliştirilen **full-stack e-ticaret uygulaması**.

Proje; kullanıcıların ürünleri görüntüleyebildiği, sepete ekleyebildiği ve sipariş oluşturabildiği bir frontend uygulaması ile tüm iş mantığını yöneten güvenli ve ölçeklenebilir bir backend REST API'den oluşmaktadır.

Admin kullanıcılar ise ürün, kategori, stok, sipariş ve kullanıcı yönetimi gibi işlemleri özel bir yönetim paneli üzerinden gerçekleştirebilir.

> 🚧 Proje geliştirme aşamasındadır.

---

## 🏗️ Proje Yapısı

```text
ecommerce/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🚀 Temel Özellikler

## 👤 Kullanıcı Sistemi

- Kullanıcı kayıt olma
- Kullanıcı girişi
- JWT authentication
- Güvenli şifre hashleme
- Kullanıcı profil bilgileri
- Role-Based Access Control
- Customer / Admin rolleri

---

## 🛍️ E-Ticaret Mağazası

Frontend üzerinden kullanıcılar:

- Ürünleri görüntüleyebilir
- Ürün detaylarını inceleyebilir
- Kategorilere göre ürünleri filtreleyebilir
- Ürün arayabilir
- Ürünleri sepete ekleyebilir
- Sepet miktarlarını değiştirebilir
- Sepetten ürün çıkarabilir
- Sipariş oluşturabilir
- Geçmiş siparişlerini görüntüleyebilir

---

## 🛒 Shopping Cart

Her kullanıcıya ait bir sepet bulunur.

```text
User
 │
 ▼
Cart
 │
 ├── CartItem
 │      └── Product
 │
 └── CartItem
        └── Product
```

Sepet özellikleri:

- Ürün ekleme
- Ürün çıkarma
- Miktar güncelleme
- Otomatik toplam hesaplama
- Stok kontrolü

---

## 💳 Order Management

Kullanıcı sepetini siparişe dönüştürebilir.

Sipariş durumları:

```text
PENDING
PREPARING
SHIPPED
DELIVERED
CANCELLED
```

Sipariş oluşturulduğunda:

```text
Cart
 ↓
Validate Products
 ↓
Check Stock
 ↓
Create Order
 ↓
Create Order Items
 ↓
Decrease Stock
 ↓
Clear Cart
```

Bu işlemler database transaction kullanılarak güvenli şekilde gerçekleştirilecektir.

---

# 🔐 Admin Panel

Admin kullanıcılar frontend içerisindeki özel yönetim paneline erişebilir.

Admin panelinden:

### 📦 Product Management

- Ürün ekleme
- Ürün düzenleme
- Ürün silme
- Ürün listeleme
- Fiyat yönetimi
- Stok yönetimi
- Kategori yönetimi

### 🗂️ Category Management

- Kategori oluşturma
- Kategori düzenleme
- Kategori silme
- Kategorileri görüntüleme

### 📋 Order Management

- Tüm siparişleri görüntüleme
- Sipariş detaylarını görüntüleme
- Sipariş durumunu değiştirme

### 👥 User Management

- Kullanıcıları görüntüleme
- Kullanıcı bilgilerini inceleme
- Kullanıcı rollerini yönetme

### 📊 Dashboard

Admin dashboard üzerinde:

- Toplam kullanıcı
- Toplam ürün
- Toplam sipariş
- Toplam gelir
- Düşük stoklu ürünler
- Son siparişler

gibi bilgiler gösterilecektir.

---

# 🖥️ Frontend

Frontend tarafı kullanıcıların ve adminlerin uygulamayla etkileşime girdiği arayüzü sağlar.

## Teknolojiler

- React
- TypeScript
- React Router
- Axios
- CSS / Tailwind CSS

Frontend'in backend REST API ile iletişimi HTTP üzerinden gerçekleştirilecektir.

```text
┌─────────────────┐
│    Frontend     │
│ React + TS      │
└────────┬────────┘
         │
         │ HTTP / JSON
         ▼
┌─────────────────┐
│     Backend     │
│ Express + TS    │
└────────┬────────┘
         │
         │ Prisma
         ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

---

# ⚙️ Backend

Backend uygulaması RESTful API mimarisi kullanır.

## Teknolojiler

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod

Backend'in sorumlulukları:

- Authentication
- Authorization
- Business logic
- Product management
- Cart management
- Order management
- Stock management
- Database operations
- Validation
- Error handling

---

# 🗃️ Database

Ana tablolar:

```text
users
products
categories
carts
cart_items
orders
order_items
```

İlişkiler:

```text
User
 ├── Cart
 │    └── CartItem
 │           └── Product
 │
 └── Order
      └── OrderItem
             └── Product

Category
 └── Product
```

---

# 🔌 API Endpoint'leri

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Products

```http
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

## Categories

```http
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

## Cart

```http
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart
```

## Orders

```http
POST  /api/orders
GET   /api/orders
GET   /api/orders/:id
PATCH /api/orders/:id/status
```

## Admin

```http
GET /api/admin/stats
GET /api/admin/users
GET /api/admin/orders
GET /api/admin/products/low-stock
```

---

# 🛠️ Teknoloji Yığını

| Katman            | Teknoloji    |
| ----------------- | ------------ |
| Frontend          | React        |
| Frontend Language | TypeScript   |
| Routing           | React Router |
| HTTP Client       | Axios        |
| Backend           | Node.js      |
| Framework         | Express.js   |
| Backend Language  | TypeScript   |
| Database          | PostgreSQL   |
| ORM               | Prisma       |
| Authentication    | JWT          |
| Password Hashing  | bcrypt       |
| Validation        | Zod          |
| API Testing       | Postman      |
| Version Control   | Git / GitHub |

---

# 📈 Development Roadmap

## Phase 1 — Project Setup

- [ ] Backend oluştur
- [ ] Frontend oluştur
- [ ] TypeScript kurulumu
- [ ] Express kurulumu
- [ ] React kurulumu
- [ ] PostgreSQL kurulumu
- [ ] Prisma kurulumu
- [ ] Environment configuration

## Phase 2 — Database

- [ ] User model
- [ ] Product model
- [ ] Category model
- [ ] Cart model
- [ ] CartItem model
- [ ] Order model
- [ ] OrderItem model
- [ ] Database relations

## Phase 3 — Authentication

- [ ] Register
- [ ] Login
- [ ] Password hashing
- [ ] JWT
- [ ] Authentication middleware
- [ ] Authorization middleware
- [ ] Customer / Admin roles

## Phase 4 — Product & Category

- [ ] Product CRUD
- [ ] Category CRUD
- [ ] Product listing
- [ ] Product details
- [ ] Search
- [ ] Filtering
- [ ] Pagination

## Phase 5 — Shopping Cart

- [ ] Cart creation
- [ ] Add product
- [ ] Remove product
- [ ] Update quantity
- [ ] Calculate total
- [ ] Stock validation

## Phase 6 — Orders

- [ ] Create order
- [ ] Order history
- [ ] Order details
- [ ] Order status
- [ ] Stock decrease
- [ ] Database transactions

## Phase 7 — Customer Frontend

- [ ] Homepage
- [ ] Product listing
- [ ] Product details
- [ ] Category pages
- [ ] Search
- [ ] Login
- [ ] Register
- [ ] User profile
- [ ] Shopping cart
- [ ] Checkout
- [ ] Order history

## Phase 8 — Admin Panel

- [ ] Admin dashboard
- [ ] Product management
- [ ] Category management
- [ ] Order management
- [ ] User management
- [ ] Stock management
- [ ] Statistics

## Phase 9 — Production

- [ ] Error handling
- [ ] Testing
- [ ] Logging
- [ ] Docker
- [ ] Redis
- [ ] Caching
- [ ] CI/CD
- [ ] Deployment
- [ ] Monitoring

---

# 🎯 Project Goals

Bu proje ile gerçek bir full-stack uygulamanın baştan sona geliştirilmesi hedeflenmektedir.

Öğrenilecek temel konular:

- REST API design
- React
- TypeScript
- Node.js
- Express.js
- PostgreSQL
- SQL
- Prisma
- Authentication
- Authorization
- JWT
- Middleware
- Validation
- Business logic
- Database transactions
- Error handling
- Frontend / Backend communication
- State management
- API integration
- Testing
- Docker
- Deployment

---

# 📌 Future Improvements

Temel sistem tamamlandıktan sonra:

- Product reviews
- Wishlist
- Coupon system
- Refresh tokens
- Email verification
- Password reset
- Redis caching
- Background jobs
- Queue system
- Payment integration
- Docker
- CI/CD
- API documentation
- Logging & monitoring

gibi özellikler eklenebilir.

---

# 📄 License

This project is developed for educational and portfolio purposes.
