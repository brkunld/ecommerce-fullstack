import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';

const app: Application = express();

// Global Middleware'ler
app.use(cors());
app.use(express.json());

// Sağlık kontrolü (Health check) endpoint'i
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'E-Ticaret REST API sorunsuz çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

export default app;
