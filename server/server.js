import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
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
if (!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set MONGO_URI and a JWT_SECRET of at least 32 characters');
}
await connectDB();

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"], scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
  imgSrc: ["'self'", 'https:', 'data:'], connectSrc: ["'self'", 'https://api.razorpay.com'],
  frameSrc: ['https://api.razorpay.com', 'https://checkout.razorpay.com'],
  styleSrc: ["'self'", "'unsafe-inline'"]
} } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api', (req, res, next) => {
  const allowed = process.env.CLIENT_URL || (process.env.RENDER_EXTERNAL_URL) || ('http://' + req.get('host'));
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') && req.get('origin') !== allowed) return res.status(403).json({ message: 'Origin not allowed' });
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { message: 'Too many AI requests. Please try again in a few minutes.' },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => req.path.startsWith('/api') ? next() : res.sendFile(path.join(clientDist, 'index.html')));
}
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
