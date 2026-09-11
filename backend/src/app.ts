import express, { type Application} from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: Application = express();

// Global Middleware'ler
app.use(cors());
app.use(express.json());

// Sağlık kontrolü (Health check) endpoint'i
app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;
