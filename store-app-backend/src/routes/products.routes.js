const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function toApi(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    unit: row.unit,
    inStock: !!row.in_stock,
    emoji: row.emoji,
    desc: row.description,
  };
}

function genId() {
  return `p_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// GET /api/products — public, anyone browsing the store can see them
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY rowid ASC').all();
  res.json(rows.map(toApi));
});

// GET /api/products/:id — public
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'المنتج غير موجود' });
  res.json(toApi(row));
});

// POST /api/products — admin only
router.post('/', requireAuth, (req, res) => {
  const { name, category, price, originalPrice, unit, inStock, emoji, desc } = req.body || {};
  if (!name || !category || price === undefined || !unit) {
    return res.status(400).json({ error: 'الاسم والتصنيف والسعر والوحدة مطلوبين' });
  }
  const id = genId();
  db.prepare(`
    INSERT INTO products (id, name, category, price, original_price, unit, in_stock, emoji, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, category, price, originalPrice || null, unit, inStock ? 1 : 0, emoji || '🛒', desc || '');

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json(toApi(row));
});

// PUT /api/products/:id — admin only
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'المنتج غير موجود' });

  const { name, category, price, originalPrice, unit, inStock, emoji, desc } = req.body || {};
  db.prepare(`
    UPDATE products SET
      name = ?, category = ?, price = ?, original_price = ?, unit = ?, in_stock = ?, emoji = ?, description = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    category ?? existing.category,
    price ?? existing.price,
    originalPrice === undefined ? existing.original_price : originalPrice,
    unit ?? existing.unit,
    inStock === undefined ? existing.in_stock : (inStock ? 1 : 0),
    emoji ?? existing.emoji,
    desc ?? existing.description,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(toApi(row));
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
  res.status(204).end();
});

module.exports = router;
