const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Initialize data directory & files
const initData = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');
  } catch (err) {
    console.warn("⚠️  Data initialization skipped (Read-only filesystem)");
  }
};

// In-memory cache for Vercel (since filesystem is read-only)
const memoryCache = {
  [USERS_FILE]: null,
  [ORDERS_FILE]: null
};

const readJSON = (file) => {
  if (memoryCache[file]) return memoryCache[file];
  try { 
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    memoryCache[file] = data;
    return data;
  }
  catch { return []; }
};

const writeJSON = (file, data) => {
  memoryCache[file] = data;
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`⚠️  Could not write to ${file}. Running in-memory mode. (Normal on Vercel)`);
  }
};

// ===========================
// MENU API
// ===========================
const menuItems = [
  { id: 1,  name: "Gobi Noodles",           price: 90.00,  veg: true,  category: "Noodles",  emoji: "🍜", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop" },
  { id: 2,  name: "Gobi Rice",              price: 90.00,  veg: true,  category: "Rice",     emoji: "🍚", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop" },
  { id: 3,  name: "Sambar Rice",            price: 49.88,  veg: true,  category: "Rice",     emoji: "🍛", image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop" },
  { id: 4,  name: "Lemon Rice (Variety)",  price: 44.89,  veg: true,  category: "Rice",     emoji: "🍱", image: "https://images.unsplash.com/photo-1626500155537-88229f34538d?w=600&auto=format&fit=crop" },
  { id: 5,  name: "Veg Biriyani",           price: 65.00,  veg: true,  category: "Biriyani", emoji: "🍲", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop" },
  { id: 6,  name: "Veg Fried Rice",         price: 75.00,  veg: true,  category: "Rice",     emoji: "🍚", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop" },
  { id: 7,  name: "Veg Hakka Noodles",      price: 59.85,  veg: true,  category: "Noodles",  emoji: "🍜", image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop" },
  { id: 8,  name: "Curd Rice",              price: 40.01,  veg: true,  category: "Rice",     emoji: "🥗", image: "https://images.unsplash.com/photo-1596797038530-2c395c01f1e1?w=600&auto=format&fit=crop" }, 
  { id: 9,  name: "Gobi 65",               price: 70.00,  veg: true,  category: "Snacks",   emoji: "🥦", image: "https://images.unsplash.com/photo-1626082927389-6cd097cbc6ec?w=600&auto=format&fit=crop" },
  { id: 10, name: "Egg Fried Rice",         price: 85.00,  veg: false, category: "Rice",     emoji: "🍳", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop" },
  { id: 11, name: "Chicken Biriyani",       price: 119.70, veg: false, category: "Biriyani", emoji: "🍗", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&auto=format&fit=crop" },
  { id: 12, name: "Chicken 65",            price: 100.00, veg: false, category: "Snacks",   emoji: "🍗", image: "https://images.unsplash.com/photo-1562967914-01efa7e87832?w=600&auto=format&fit=crop" },
  { id: 13, name: "Chicken Kothu Parrota", price: 100.00, veg: false, category: "Special",  emoji: "🥙", image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop" },
  { id: 14, name: "Egg Kothu Parrota",     price: 100.00, veg: false, category: "Special",  emoji: "🥙", image: "https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f6?w=600&auto=format&fit=crop" },
  { id: 15, name: "Egg Noodles",           price: 100.00, veg: false, category: "Noodles",  emoji: "🍜", image: "https://images.unsplash.com/photo-1552611052-3ba9d45a76e7?w=600&auto=format&fit=crop" },
  { id: 16, name: "Grill Chicken Half",    price: 180.00, veg: false, category: "Grill",    emoji: "🍖", image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=600&auto=format&fit=crop" },
  { id: 17, name: "Grill Chicken Full",    price: 360.00, veg: false, category: "Grill",    emoji: "🍖", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop" },
  { id: 18, name: "Egg Fried Rice Special",price: 100.00, veg: false, category: "Rice",     emoji: "🍳", image: "https://images.unsplash.com/photo-1622312674332-9cbddf1b0a64?w=600&auto=format&fit=crop" },
];

app.get('/api/menu', (req, res) => res.json(menuItems));

// ===========================
// USERS API
// ===========================

// Save / Update user profile
app.post('/api/users', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const users = readJSON(USERS_FILE);
  const idx = users.findIndex(u => u.email === email);
  const now = new Date().toISOString();

  // Only take non-undefined fields from req.body
  const updateData = {};
  const fields = ['googleId', 'googleName', 'googlePhoto', 'studentName', 'regNo', 'department', 'year', 'phone'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) updateData[f] = req.body[f];
  });

  if (idx >= 0) {
    // Update existing user
    users[idx] = { ...users[idx], ...updateData, updatedAt: now };
  } else {
    // Create new user
    const newUser = { email, ...updateData, createdAt: now, updatedAt: now };
    users.push(newUser);
  }

  writeJSON(USERS_FILE, users);
  res.json({ success: true, user: users[idx >= 0 ? idx : users.length - 1] });
});

// Get user by email
app.get('/api/users/:email', (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === decodeURIComponent(req.params.email));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ===========================
// ORDERS API
// ===========================

// Create new order
app.post('/api/orders', (req, res) => {
  const { email, studentName, regNo, department, items, subtotal, gst, total, paymentMethod, paymentRef } = req.body;
  if (!email || !items) return res.status(400).json({ error: 'Email and items required' });

  const orders = readJSON(ORDERS_FILE);
  const orderId = 'ORD' + Date.now();
  const order = {
    orderId,
    email,
    studentName,
    regNo,
    department,
    items,
    subtotal,
    gst,
    total,
    paymentMethod,
    paymentRef,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

// Get orders by user email
app.get('/api/orders/user/:email', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const userOrders = orders
    .filter(o => o.email === decodeURIComponent(req.params.email))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

// Get single order by ID
app.get('/api/orders/:orderId', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Get ALL orders (reception/admin view)
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

// Catch-all: serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

initData();

// Export the app for Vercel
module.exports = app;

// Only listen if not running as a serverless function
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🍽️  College Food Order Server`);
    console.log(`🚀  Running at: http://localhost:${PORT}`);
    console.log(`📂  Data stored in: ${DATA_DIR}\n`);
  });
}
