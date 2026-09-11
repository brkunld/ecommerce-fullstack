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

Proje, teknolojileri ve backend/frontend mimarisini adım adım öğrenerek geliştirmek amacıyla aşağıdaki sırayla ilerletilecektir.

---

## 1️⃣ Express + TypeScript Kurulumu

* [x] Node.js projesinin oluşturulması
* [x] Express.js kurulumu
* [x] TypeScript kurulumu
* [x] `tsconfig.json` yapılandırması
* [x] Development script'lerinin hazırlanması
* [x] İlk Express server'ın oluşturulması
* [x] `/api/health` endpoint'inin oluşturulması
* [x] Environment variables yapısının hazırlanması

**Hedef:**

Node.js + Express + TypeScript kullanarak çalışan temel REST API'yi oluşturmak.

---

## 2️⃣ Proje Klasör Yapısı

Backend'in büyümesini kolaylaştıracak modüler bir klasör yapısı oluşturulacaktır.

* [x] Routes yapısı
* [ ] Controllers
* [ ] Services
* [x] Middleware
* [x] Validators
* [x] Utils
* [x] Config
* [x] Error handling yapısı

Örnek yapı:

```text
backend/
└── src/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── middleware/
    ├── validators/
    ├── utils/
    ├── config/
    ├── app.ts
    └── server.ts
```

**Hedef:**

Business logic ile HTTP işlemlerini birbirinden ayırarak daha temiz ve sürdürülebilir bir backend mimarisi oluşturmak.

---

## 3️⃣ PostgreSQL + Prisma

* [x] PostgreSQL kurulumu
* [x] Database oluşturulması
* [x] Prisma kurulumu
* [x] Prisma configuration
* [x] Database connection
* [x] İlk migration
* [x] Prisma Client kullanımı
* [x] CRUD işlemlerinin Prisma ile gerçekleştirilmesi

**Hedef:**

Backend ile PostgreSQL arasındaki bağlantıyı kurmak ve database işlemlerini Prisma ORM üzerinden yönetmek.

---

## 4️⃣ User Modeli

İlk database entity'si olarak kullanıcı sistemi oluşturulacaktır.

* [ ] User model
* [ ] User migration
* [ ] User repository/service işlemleri
* [ ] User CRUD
* [ ] Unique email kontrolü
* [ ] User role alanı

Temel roller:

```text
CUSTOMER
ADMIN
```

**Hedef:**

Kullanıcı sisteminin database tarafındaki temelini oluşturmak.

---

## 5️⃣ Register / Login

Authentication sisteminin temel işlemleri oluşturulacaktır.

### Register

* [ ] Register endpoint
* [ ] Request validation
* [ ] Email kontrolü
* [ ] Password hashing
* [ ] User oluşturma
* [ ] Response yapısı

### Login

* [ ] Login endpoint
* [ ] Email kontrolü
* [ ] Password doğrulama
* [ ] Authentication işlemi
* [ ] JWT oluşturma

Endpoint'ler:

```http
POST /api/auth/register
POST /api/auth/login
```

**Hedef:**

Kullanıcıların güvenli şekilde kayıt olup giriş yapabilmesini sağlamak.

---

## 6️⃣ JWT + Authorization

Authentication sisteminin güvenli hale getirilmesi.

* [ ] JWT oluşturma
* [ ] JWT doğrulama
* [ ] Authentication middleware
* [ ] Current user bilgisi
* [ ] Authorization middleware
* [ ] Role-based access control
* [ ] Customer/Admin yetkilendirmesi

Örnek:

```text
Request
   ↓
JWT
   ↓
Authentication
   ↓
Authorization
   ↓
Controller
```

Örneğin:

```text
CUSTOMER → Product okuyabilir
ADMIN    → Product oluşturabilir / güncelleyebilir / silebilir
```

**Hedef:**

Korumalı endpoint'ler ve rol bazlı yetkilendirme sistemi oluşturmak.

---

## 7️⃣ Product + Category

E-ticaret sisteminin temel ürün yapısı oluşturulacaktır.

### Category

* [ ] Category model
* [ ] Category CRUD
* [ ] Category validation
* [ ] Category/Product relationship

### Product

* [ ] Product model
* [ ] Product CRUD
* [ ] Product validation
* [ ] Price management
* [ ] Stock management
* [ ] Category relationship
* [ ] Product listing
* [ ] Product details
* [ ] Search
* [ ] Filtering
* [ ] Sorting
* [ ] Pagination

Endpoint örnekleri:

```http
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

**Hedef:**

E-ticaret mağazasının ürün ve kategori altyapısını tamamlamak.

---

## 8️⃣ Cart

Kullanıcı bazlı alışveriş sepeti sistemi geliştirilecektir.

* [ ] Cart model
* [ ] CartItem model
* [ ] User/Cart relationship
* [ ] Product/CartItem relationship
* [ ] Sepete ürün ekleme
* [ ] Sepetten ürün çıkarma
* [ ] Miktar güncelleme
* [ ] Sepet temizleme
* [ ] Toplam fiyat hesaplama
* [ ] Stok kontrolü

Endpoint'ler:

```http
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart
```

**Hedef:**

Kullanıcıların ürünleri sepete ekleyip yönetebileceği tam bir cart sistemi oluşturmak.

---

## 9️⃣ Order

Sepetin siparişe dönüştürülmesi.

* [ ] Order model
* [ ] OrderItem model
* [ ] Cart → Order dönüşümü
* [ ] Order oluşturma
* [ ] Order details
* [ ] Order history
* [ ] Kullanıcının kendi siparişlerini görüntülemesi
* [ ] Admin'in tüm siparişleri görüntülemesi
* [ ] Order status

Sipariş durumları:

```text
PENDING
PREPARING
SHIPPED
DELIVERED
CANCELLED
```

Endpoint'ler:

```http
POST  /api/orders
GET   /api/orders
GET   /api/orders/:id
PATCH /api/orders/:id/status
```

**Hedef:**

Sepet → Sipariş akışını oluşturmak ve sipariş yaşam döngüsünü yönetmek.

---

## 🔟 Stock Transaction

Sipariş ve stok işlemlerinin güvenli şekilde gerçekleştirilmesi.

* [ ] Database transaction
* [ ] Stock validation
* [ ] Stock decrease
* [ ] Transaction rollback
* [ ] Race condition problemlerinin incelenmesi
* [ ] Concurrent order senaryolarının yönetilmesi

Sipariş oluşturma akışı:

```text
Cart
 ↓
Check Products
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
 ↓
COMMIT
```

Hata durumunda:

```text
ROLLBACK
```

**Hedef:**

Aynı ürünün aynı anda birden fazla kullanıcı tarafından satın alınması gibi durumlarda stok tutarlılığını korumak.

---

## 1️⃣1️⃣ React Frontend

Backend API tamamlandıktan sonra kullanıcı arayüzü geliştirilecektir.

### Frontend Setup

* [ ] React kurulumu
* [ ] TypeScript kurulumu
* [ ] React Router
* [ ] Axios
* [ ] API client
* [ ] Environment configuration
* [ ] Component structure

### Customer Interface

* [ ] Homepage
* [ ] Product listing
* [ ] Product details
* [ ] Category pages
* [ ] Search
* [ ] Filtering
* [ ] Login
* [ ] Register
* [ ] User profile
* [ ] Shopping cart
* [ ] Checkout
* [ ] Order history
* [ ] Order details

### API Integration

```text
React Frontend
      ↓
     Axios
      ↓
Express REST API
      ↓
    Prisma
      ↓
 PostgreSQL
```

**Hedef:**

Backend API ile haberleşen gerçek bir e-ticaret kullanıcı arayüzü oluşturmak.

---

## 1️⃣2️⃣ Admin Panel

Admin kullanıcılar için ayrı bir yönetim paneli oluşturulacaktır.

### Dashboard

* [ ] Total users
* [ ] Total products
* [ ] Total orders
* [ ] Total revenue
* [ ] Low-stock products
* [ ] Recent orders

### Product Management

* [ ] Product list
* [ ] Create product
* [ ] Edit product
* [ ] Delete product
* [ ] Stock management

### Category Management

* [ ] Category list
* [ ] Create category
* [ ] Edit category
* [ ] Delete category

### Order Management

* [ ] All orders
* [ ] Order details
* [ ] Update order status

### User Management

* [ ] User list
* [ ] User details
* [ ] Role management

**Hedef:**

E-ticaret sisteminin tüm yönetim işlemlerinin gerçekleştirilebildiği bir admin panel oluşturmak.

---

## 1️⃣3️⃣ Docker

Uygulamanın container ortamında çalıştırılması.

* [ ] Docker temelleri
* [ ] Dockerfile
* [ ] Docker image
* [ ] Docker container
* [ ] Docker Compose
* [ ] Backend container
* [ ] PostgreSQL container
* [ ] Frontend container
* [ ] Environment variables
* [ ] Development environment

Örnek yapı:

```text
Docker Compose
│
├── Frontend
│
├── Backend
│
├── PostgreSQL
│
└── Redis
```

**Hedef:**

Projenin farklı bilgisayarlarda ve production ortamında daha kolay çalıştırılabilmesini sağlamak.

---

## 1️⃣4️⃣ Deployment

Uygulamanın production ortamına taşınması.

### Backend

* [ ] Production environment
* [ ] Environment variables
* [ ] Database configuration
* [ ] Build process
* [ ] API deployment

### Frontend

* [ ] Production build
* [ ] Environment configuration
* [ ] Frontend deployment

### Database

* [ ] Production PostgreSQL
* [ ] Production migrations
* [ ] Database security

### Production

* [ ] CORS configuration
* [ ] Error handling
* [ ] Logging
* [ ] Health checks
* [ ] Monitoring
* [ ] HTTPS
* [ ] CI/CD pipeline

Son hedef:

```text
                    ┌──────────────┐
                    │    Users     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Frontend   │
                    │    React     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Backend   │
                    │   Express    │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    ▼              ▼
              PostgreSQL         Redis
```

**Hedef:**

Full-stack e-ticaret uygulamasını production ortamında çalışır hale getirmek.

---

# 🎯 Final Project

Tüm aşamalar tamamlandığında ortaya şu yapıda bir full-stack uygulama çıkacaktır:

```text
                 🛒 E-Commerce
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    Customer App               Admin Panel
       React                     React
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
                REST API
              Node + Express
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
          PostgreSQL           Redis
             Prisma
```

### Öğrenme Sırası

```text
Express + TypeScript
        ↓
Project Architecture
        ↓
PostgreSQL + Prisma
        ↓
User Model
        ↓
Register / Login
        ↓
JWT + Authorization
        ↓
Product + Category
        ↓
Cart
        ↓
Order
        ↓
Stock Transactions
        ↓
React Frontend
        ↓
Admin Panel
        ↓
Docker
        ↓
Deployment
```

Bu sırayla ilerleyerek proje sonunda **React + TypeScript + Node.js + Express + PostgreSQL + Prisma + JWT + Docker** teknolojilerini kullanan, gerçek bir full-stack e-ticaret uygulaması oluşturulması hedeflenmektedir.

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
