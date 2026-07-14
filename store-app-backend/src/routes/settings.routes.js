const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — public (the storefront needs storeName/waNumber to render)
router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json({ storeName: row.store_name, waNumber: row.wa_number });
});

// PUT /api/settings — admin only
router.put('/', requireAuth, (req, res) => {
  const { storeName, waNumber } = req.body || {};
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  db.prepare('UPDATE settings SET store_name = ?, wa_number = ? WHERE id = 1').run(
    storeName ?? existing.store_name,
    waNumber ?? existing.wa_number
  );
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json({ storeName: row.store_name, waNumber: row.wa_number });
});

module.exports = router;
