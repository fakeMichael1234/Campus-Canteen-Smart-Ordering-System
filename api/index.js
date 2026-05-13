const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const DATA_DIR = path.join(__dirname, '../backend/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const initData = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');
  } catch (err) {
    console.warn('⚠️  Data init skipped (read-only fs)');
  }
};

// In-memory cache (works on Vercel serverless too)
const cache = { [USERS_FILE]: null, [ORDERS_FILE]: null };

const readJSON = (file) => {
  if (cache[file]) return cache[file];
  try { cache[file] = JSON.parse(fs.readFileSync(file, 'utf8')); return cache[file]; }
  catch { return []; }
};

const writeJSON = (file, data) => {
  cache[file] = data;
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
  catch { console.warn(`⚠️  Write skipped for ${path.basename(file)} (in-memory mode)`); }
};

// ── MENU ──────────────────────────────────────────────────────────────────────
const menuItems = [
  { id: 1,  name: 'Gobi Noodles',          price: 90.00,  veg: true,  category: 'Noodles',  emoji: '🍜' },
  { id: 2,  name: 'Gobi Rice',             price: 90.00,  veg: true,  category: 'Rice',     emoji: '🍚' },
  { id: 3,  name: 'Sambar Rice',           price: 49.88,  veg: true,  category: 'Rice',     emoji: '🍛' },
  { id: 4,  name: 'Lemon Rice (Variety)',  price: 44.89,  veg: true,  category: 'Rice',     emoji: '🍱' },
  { id: 5,  name: 'Veg Biriyani',          price: 65.00,  veg: true,  category: 'Biriyani', emoji: '🍲' },
  { id: 6,  name: 'Veg Fried Rice',        price: 75.00,  veg: true,  category: 'Rice',     emoji: '🍚' },
  { id: 7,  name: 'Veg Hakka Noodles',     price: 59.85,  veg: true,  category: 'Noodles',  emoji: '🍜' },
  { id: 8,  name: 'Curd Rice',             price: 40.01,  veg: true,  category: 'Rice',     emoji: '🥗' },
  { id: 9,  name: 'Gobi 65',              price: 70.00,  veg: true,  category: 'Snacks',   emoji: '🥦' },
  { id: 10, name: 'Egg Fried Rice',        price: 85.00,  veg: false, category: 'Rice',     emoji: '🍳' },
  { id: 11, name: 'Chicken Biriyani',      price: 119.70, veg: false, category: 'Biriyani', emoji: '🍗' },
  { id: 12, name: 'Chicken 65',           price: 100.00, veg: false, category: 'Snacks',   emoji: '🍗' },
  { id: 13, name: 'Chicken Kothu Parrota',price: 100.00, veg: false, category: 'Special',  emoji: '🥙' },
  { id: 14, name: 'Egg Kothu Parrota',    price: 100.00, veg: false, category: 'Special',  emoji: '🥙' },
  { id: 15, name: 'Egg Noodles',          price: 100.00, veg: false, category: 'Noodles',  emoji: '🍜' },
  { id: 16, name: 'Grill Chicken Half',   price: 180.00, veg: false, category: 'Grill',    emoji: '🍖' },
  { id: 17, name: 'Grill Chicken Full',   price: 360.00, veg: false, category: 'Grill',    emoji: '🍖' },
  { id: 18, name: 'Egg Fried Rice Special',price: 100.00,veg: false, category: 'Rice',     emoji: '🍳' },
];

app.get('/api/menu', (req, res) => res.json(menuItems));

// ── USERS ──────────────────────────────────────────────────────────────────────
app.post('/api/users', (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  email = email.toLowerCase().trim();

  const users = readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.email.toLowerCase() === email);
  const now = new Date().toISOString();

  // Only update fields that are explicitly provided (not undefined)
  const allowed = ['googleId','googleName','googlePhoto','studentName','regNo','department','year','phone','hostel','cart'];
  const update = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

  let userRecord;
  if (idx >= 0) {
    const existing = users[idx];
    const existingActivities = existing.activities || [];
    const newAct = req.body.activity;
    const activities = newAct
      ? [...existingActivities, { ...newAct, timestamp: now }].slice(-50)
      : existingActivities;
    users[idx] = { ...existing, ...update, email, activities, updatedAt: now };
    userRecord = users[idx];
  } else {
    userRecord = {
      email, ...update,
      activities: req.body.activity ? [{ ...req.body.activity, timestamp: now }] : [],
      createdAt: now, updatedAt: now
    };
    users.push(userRecord);
  }

  writeJSON(USERS_FILE, users);
  res.json({ success: true, user: userRecord });
});

// Get user by email (case-insensitive)
app.get('/api/users/:email', (req, res) => {
  const users = readJSON(USERS_FILE);
  const search = decodeURIComponent(req.params.email).toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === search);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Get ALL users (admin)
app.get('/api/users', (req, res) => {
  const users = readJSON(USERS_FILE);
  res.json(users.length);
});

// ── ORDERS ─────────────────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { email, studentName, regNo, department, year, items, subtotal, gst, total, paymentMethod, paymentRef } = req.body;
  if (!email || !items) return res.status(400).json({ error: 'Email and items required' });

  const orders = readJSON(ORDERS_FILE);
  const orderId = 'ORD' + Date.now();
  const order = {
    orderId,
    email: email.toLowerCase().trim(),
    studentName, regNo, department, year,
    items, subtotal, gst, total,
    paymentMethod, paymentRef,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

// User's orders
app.get('/api/orders/user/:email', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const search = decodeURIComponent(req.params.email).toLowerCase().trim();
  const userOrders = orders
    .filter(o => o.email.toLowerCase() === search)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

// Single order
app.get('/api/orders/:orderId', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// All orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Update order status
app.patch('/api/orders/:orderId', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const idx = orders.findIndex(o => o.orderId === req.params.orderId);
  if (idx < 0) return res.status(404).json({ error: 'Order not found' });
  orders[idx] = { ...orders[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, order: orders[idx] });
});

// ── STATS (admin dashboard) ────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const users = readJSON(USERS_FILE);
  const revenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const itemsServed = orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty, 0), 0);
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  res.json({
    totalOrders: orders.length,
    totalRevenue: revenue.toFixed(2),
    totalUsers: users.length,
    itemsServed,
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(2)
  });
});

// ── CATCH-ALL (SPA) ────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

initData();

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('\n🍽️  Campus Bites Server');
    console.log(`🚀  http://localhost:${PORT}`);
    console.log(`📊  Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`📂  Data: ${DATA_DIR}\n`);
  });
}
