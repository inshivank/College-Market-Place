import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import uploadRoutes from './routes/upload.js';
import wishlistRoutes from './routes/wishlist.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigins = ['http://localhost:5173'];

if (CLIENT_URL && !allowedOrigins.includes(CLIENT_URL)) {
  allowedOrigins.push(CLIENT_URL);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'College Marketplace API is running'
  });
});

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);

function printRegisteredRoutes() {
  const mountedRouters = [
    ['/api/admin', adminRoutes],
    ['/api/auth', authRoutes],
    ['/api/items', itemRoutes],
    ['/api/upload', uploadRoutes],
    ['/api/wishlist', wishlistRoutes]
  ];

  console.log('Registered Express routes:');
  console.log('GET /api/health');

  mountedRouters.forEach(([mountPath, router]) => {
    router.stack
      .filter((layer) => layer.route)
      .forEach((layer) => {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        const routePath = layer.route.path === '/' ? '' : layer.route.path;
        console.log(`${methods} ${mountPath}${routePath}`);
      });
  });
}

printRegisteredRoutes();

async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
