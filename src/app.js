const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');

// ─── Routes ───────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes');
const brandRoutes     = require('./routes/brand.routes');
const kategoriRoutes  = require('./routes/kategori.routes');
const ukuranRoutes    = require('./routes/ukuran.routes');
const produkRoutes    = require('./routes/produk.routes');
const orderRoutes     = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const exportRoutes    = require('./routes/export.routes');
const userRoutes      = require('./routes/user.routes');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Body Parser ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Logger ──────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ─── Static Files ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/brand',     brandRoutes);
app.use('/api/kategori',  kategoriRoutes);
app.use('/api/ukuran',    ukuranRoutes);
app.use('/api/produk',    produkRoutes);
app.use('/api/order',     orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export',    exportRoutes);
app.use('/api/users',     userRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'OK',
    message:   'ShoeStore API is running',
    timestamp: new Date(),
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
