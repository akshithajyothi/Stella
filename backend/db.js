// backend/db.js
// Single embedded SQLite database for the whole backend. No external service to run/provision —
// the file is created and seeded automatically on first boot.
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "restyle.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    bio TEXT,
    city TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    size TEXT,
    price INTEGER NOT NULL,
    badge TEXT,
    image TEXT NOT NULL,
    gender TEXT,
    color TEXT,
    condition TEXT,
    category TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    items TEXT NOT NULL,              -- JSON: [{productId, name, price, image, quantity}]
    shipping_address TEXT NOT NULL,   -- JSON: ShippingAddress
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | cancelled
    razorpay_payment_link_id TEXT,
    razorpay_payment_link_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS negotiation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    listing_price INTEGER NOT NULL,
    floor_price INTEGER NOT NULL,
    current_offer INTEGER NOT NULL,
    round INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- active | accepted | rejected | final
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS negotiation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES negotiation_sessions(id),
    role TEXT NOT NULL, -- buyer | agent
    content TEXT NOT NULL,
    offer_amount INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migration: negotiation_sessions may already exist from before user_id was added — CREATE
// TABLE IF NOT EXISTS won't add it to an existing table, so add it explicitly if missing.
// This must not touch existing rows/users/orders in an already-running dev database.
const negotiationCols = db.prepare("PRAGMA table_info(negotiation_sessions)").all().map((c) => c.name);
if (!negotiationCols.includes("user_id")) {
  db.exec("ALTER TABLE negotiation_sessions ADD COLUMN user_id INTEGER REFERENCES users(id)");
  console.log("Migrated negotiation_sessions: added user_id column.");
}

// Seed products once, from the same catalog the frontend pages render, so a cart item's
// numeric id always resolves to a real row here (fixes the earlier Mongo-ObjectId mismatch).
const productCount = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
if (productCount === 0) {
  const seed = require("./data/products-seed.json");
  const insert = db.prepare(`
    INSERT INTO products (id, name, size, price, badge, image, gender, color, condition, category, description)
    VALUES (@id, @name, @size, @price, @badge, @image, @gender, @color, @condition, @category, @description)
  `);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(seed);
  console.log(`Seeded ${seed.length} products into SQLite.`);
}

module.exports = db;
