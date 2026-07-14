require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Fail fast with a clear message if a required secret is missing or was left as the example placeholder.
const PLACEHOLDER_JWT = 'REPLACE_WITH_YOUR_OWN_LONG_RANDOM_SECRET';
const PLACEHOLDER_PASSWORD = 'REPLACE_WITH_YOUR_OWN_STRONG_PASSWORD';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === PLACEHOLDER_JWT) {
  console.error(
    '❌ خطأ: JWT_SECRET مش موجود أو لسه القيمة الافتراضية من .env.example. افتح ملف .env وحط قيمة عشوائية خاصة بيك.'
  );
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === PLACEHOLDER_PASSWORD) {
  console.error(
    '❌ خطأ: ADMIN_PASSWORD مش موجودة أو لسه القيمة الافتراضية من .env.example. افتح ملف .env وحط كلمة سر قوية خاصة بيك.'
  );
  process.exit(1);
}

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  })
);

// General API rate limit (protects against abuse/scraping).
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'المسار غير موجود' }));

// Generic error handler (so an unexpected error still returns clean JSON)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'حصل خطأ في السيرفر' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend API شغال على http://localhost:${PORT}`);
});
