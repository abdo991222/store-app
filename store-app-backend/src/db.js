const path = require('path');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

// node:sqlite is Node's own built-in SQLite driver (available since Node 22.5+).
// We use it instead of a third-party native module (like better-sqlite3) so
// that `npm install` never needs a C++ compiler / Python / Visual Studio Build
// Tools on the user's machine — it just works out of the box on any OS.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 5)) {
  console.error(
    `❌ الإصدار ده من Node.js (${process.versions.node}) قديم جداً. محتاج Node.js 22.5 أو أحدث ` +
    `(لأن الداتابيز بتستخدم node:sqlite المدمجة في Node نفسه). حدّث Node من https://nodejs.org`
  );
  process.exit(1);
}

const DB_PATH = path.join(__dirname, '..', 'data', 'store.sqlite');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/** node:sqlite has no built-in `.transaction()` helper like better-sqlite3 does, so we make a tiny one. */
function transaction(fn) {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
}

// ---------------------------------------------------------------
// SCHEMA — creates tables the first time the server ever runs.
// ---------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    unit TEXT NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 1,
    emoji TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total REAL NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_location TEXT,
    customer_notes TEXT,
    method TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    qty INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    store_name TEXT NOT NULL,
    wa_number TEXT NOT NULL
  );
`);

// ---------------------------------------------------------------
// SEED — runs once: only inserts data if the tables are empty,
// so it never overwrites anything you already changed.
// ---------------------------------------------------------------
function seed() {
  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (productCount === 0) {
    const SEED_PRODUCTS = [
      { id: 'p1', name: 'لحم غنم طازج', category: 'meat', price: 55, originalPrice: 65, unit: 'كجم', inStock: 1, emoji: '🥩', desc: 'لحم غنم سعودي طازج، مقطع حسب الطلب، مصدر موثوق ومراقب صحياً.' },
      { id: 'p2', name: 'لحم بقري مفروم', category: 'meat', price: 45, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🍖', desc: 'لحم بقري مفروم طازج يومياً، خالٍ من الدهون الزائدة، مثالي للكبسة والبرغر.' },
      { id: 'p3', name: 'دجاج طازج كامل', category: 'meat', price: 22, originalPrice: null, unit: 'حبة', inStock: 1, emoji: '🍗', desc: 'دجاج طازج كامل منظف وجاهز للطبخ، حجم متوسط.' },
      { id: 'p4', name: 'صدور دجاج', category: 'meat', price: 30, originalPrice: 38, unit: 'كجم', inStock: 1, emoji: '🍗', desc: 'صدور دجاج منزوعة العظم والجلد، غنية بالبروتين.' },
      { id: 'p5', name: 'لحم إبل طازج', category: 'meat', price: 70, originalPrice: null, unit: 'كجم', inStock: 0, emoji: '🥩', desc: 'لحم إبل طازج فاخر، متوفر حسب الطلب المسبق.' },
      { id: 'p6', name: 'كبدة طازجة', category: 'meat', price: 40, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🍖', desc: 'كبدة غنم طازجة، تُجهّز يومياً في المحل.' },
      { id: 'p7', name: 'طماطم بلدي', category: 'vegetables', price: 4.5, originalPrice: 6, unit: 'كجم', inStock: 1, emoji: '🍅', desc: 'طماطم بلدي طازجة مباشرة من المزارع المحلية.' },
      { id: 'p8', name: 'خيار طازج', category: 'vegetables', price: 5, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🥒', desc: 'خيار طازج مقرمش، مثالي للسلطات.' },
      { id: 'p9', name: 'بطاطس', category: 'vegetables', price: 4, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🥔', desc: 'بطاطس درجة أولى، حجم متوسط، مناسبة للقلي والطبخ.' },
      { id: 'p10', name: 'بصل أحمر', category: 'vegetables', price: 3.5, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🧅', desc: 'بصل أحمر طازج عالي الجودة.' },
      { id: 'p11', name: 'جزر طازج', category: 'vegetables', price: 4.5, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🥕', desc: 'جزر طازج حلو المذاق، غني بالفيتامينات.' },
      { id: 'p12', name: 'فلفل رومي ملون', category: 'vegetables', price: 8, originalPrice: null, unit: 'كجم', inStock: 1, emoji: '🫑', desc: 'تشكيلة فلفل رومي أحمر وأصفر وأخضر طازج.' },
      { id: 'p13', name: 'بقدونس', category: 'vegetables', price: 2, originalPrice: null, unit: 'حزمة', inStock: 1, emoji: '🌿', desc: 'بقدونس طازج مغسول وجاهز للاستخدام.' },
      { id: 'p14', name: 'خس أمريكي', category: 'vegetables', price: 4, originalPrice: null, unit: 'حبة', inStock: 0, emoji: '🥬', desc: 'خس أمريكي طازج ومقرمش.' },
    ];
    const insert = db.prepare(`
      INSERT INTO products (id, name, category, price, original_price, unit, in_stock, emoji, description)
      VALUES (@id, @name, @category, @price, @originalPrice, @unit, @inStock, @emoji, @desc)
    `);
    const insertMany = transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(SEED_PRODUCTS);
    console.log(`Seeded ${SEED_PRODUCTS.length} products.`);
  }

  const settingsCount = db.prepare('SELECT COUNT(*) AS c FROM settings').get().c;
  if (settingsCount === 0) {
    db.prepare('INSERT INTO settings (id, store_name, wa_number) VALUES (1, ?, ?)').run(
      'مزرعة الخير',
      '966500000000'
    );
    console.log('Seeded default settings.');
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminExists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(adminUsername);
  if (!adminExists) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(adminUsername, hash);
    console.log(`Seeded admin user "${adminUsername}".`);
  }
}

seed();

module.exports = { db, transaction };
