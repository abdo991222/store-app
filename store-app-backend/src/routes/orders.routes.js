const express = require('express');
const { db, transaction } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function genId() {
  return `ord_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function orderToApi(orderRow, itemRows) {
  return {
    id: orderRow.id,
    date: orderRow.date,
    status: orderRow.status,
    total: orderRow.total,
    method: orderRow.method,
    customer: {
      name: orderRow.customer_name,
      phone: orderRow.customer_phone,
      address: orderRow.customer_address,
      location: orderRow.customer_location || '',
      notes: orderRow.customer_notes || '',
    },
    items: itemRows.map((it) => ({
      id: it.product_id,
      qty: it.qty,
      product: {
        id: it.product_id,
        name: it.product_name,
        price: it.unit_price,
        // The rest of the product's fields (emoji/category/unit) are looked up
        // from the products table by the front-end when needed; the order
        // itself only needs to remember the name/price/qty at purchase time.
      },
    })),
  };
}

// GET /api/orders/lookup?phone=... — public. Lets a customer look up their
// own orders by phone number (no account needed). Returns the most recent
// orders for that phone number.
router.get('/lookup', (req, res) => {
  const phone = String(req.query.phone || '').trim();
  if (!phone) return res.status(400).json({ error: 'رقم الجوال مطلوب' });

  const orders = db
    .prepare('SELECT * FROM orders WHERE customer_phone = ? ORDER BY date DESC LIMIT 10')
    .all(phone);
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  res.json(orders.map((o) => orderToApi(o, itemsStmt.all(o.id))));
});

// GET /api/orders — admin only
router.get('/', requireAuth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY date DESC').all();
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  res.json(orders.map((o) => orderToApi(o, itemsStmt.all(o.id))));
});

// GET /api/orders/:id — public. Order IDs are long random/unguessable strings
// (like a confirmation number), so this lets a customer check their own
// order's status after closing the site and coming back, without needing an
// account. It does NOT let anyone browse/list all orders (that's the
// admin-only route above).
router.get('/:id', (req, res) => {
  const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!orderRow) return res.status(404).json({ error: 'الطلب غير موجود' });
  const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json(orderToApi(orderRow, itemRows));
});

// POST /api/orders — public (this is the checkout submission)
router.post('/', (req, res) => {
  const { items, customer, method } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'السلة فارغة' });
  }
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'بيانات العميل ناقصة (الاسم، الجوال، العنوان مطلوبين)' });
  }

  // Re-price every item from the database — never trust a price sent by the client.
  const productStmt = db.prepare('SELECT * FROM products WHERE id = ?');
  const resolvedItems = [];
  let total = 0;

  for (const it of items) {
    const product = productStmt.get(it.id);
    if (!product) return res.status(400).json({ error: `منتج غير موجود: ${it.id}` });
    const qty = Math.max(1, parseInt(it.qty, 10) || 1);
    resolvedItems.push({ productId: product.id, name: product.name, price: product.price, qty });
    total += product.price * qty;
  }

  const id = genId();
  const date = new Date().toISOString();

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, date, status, total, customer_name, customer_phone, customer_address, customer_location, customer_notes, method)
    VALUES (@id, @date, 'pending', @total, @name, @phone, @address, @location, @notes, @method)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty)
    VALUES (?, ?, ?, ?, ?)
  `);

  const run = transaction(() => {
    insertOrder.run({
      id,
      date,
      total,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      location: customer.location || null,
      notes: customer.notes || null,
      method: method === 'whatsapp' ? 'whatsapp' : 'website',
    });
    for (const it of resolvedItems) {
      insertItem.run(id, it.productId, it.name, it.price, it.qty);
    }
  });
  run();

  const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  res.status(201).json(orderToApi(orderRow, itemRows));
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'حالة غير معروفة' });
  }
  const info = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'الطلب غير موجود' });

  const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json(orderToApi(orderRow, itemRows));
});

module.exports = router;
