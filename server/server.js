import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
if (process.env.VERCEL) app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { message: 'Too many AI requests. Please wait a few minutes.' },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0-enterprise', timestamp: new Date().toISOString() });
});

app.use('/api', async (req, res, next) => {
  try { await connectDB(); next(); }
  catch { res.status(503).json({ message: 'The database is temporarily unavailable. Please try again.' }); }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  connectDB().then(() => app.listen(PORT, () => {
    console.log(`NovaCart Enterprise API running on port ${PORT}`);
  })).catch(() => { console.error('Could not connect to the database.'); process.exitCode = 1; });
}

export default app;
