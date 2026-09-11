import dotenv from 'dotenv';
import app from './app.js';

// .env dosyasındaki değişkenleri yükle
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor!`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});
