# 1. Prisma ile tam uyumlu Node.js 20 Slim imajı
FROM node:20-slim

# 2. Prisma için gerekli OpenSSL paketini yüklüyoruz
RUN apt-get update -y && apt-get install -y openssl

# 3. Çalışma klasörü
WORKDIR /app

# 4. Bağımlılıkları kopyala
COPY package*.json ./
COPY prisma ./prisma/

# 5. Paketleri yükle ve Prisma Client'ı oluştur
RUN npm install
RUN npx prisma generate

# 6. Kaynak kodları kopyala
COPY . .

# 7. Portu aç
EXPOSE 5000

# 8. Veritabanı tablolarını oluştur ve backend'i başlat
CMD ["sh", "-c", "npx prisma db push && npm run dev"]
