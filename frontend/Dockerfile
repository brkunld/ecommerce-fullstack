# 1. Node.js 20 Alpine taban imajı
FROM node:20-alpine

# 2. Çalışma klasörü
WORKDIR /app

# 3. Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install

# 4. Tüm frontend kaynak kodlarını kopyala
COPY . .

# 5. Vite portunu dışarı aç
EXPOSE 5173

# 6. Vite'ı dışarıdan erişilebilir modda başlat (--host 0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
