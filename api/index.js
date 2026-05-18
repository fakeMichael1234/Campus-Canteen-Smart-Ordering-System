const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const menuItems = [
  { id: "gobi-noodles", name: "Gobi Noodles", price: 90, veg: true, category: "Noodles" },
  { id: "chicken-biriyani", name: "Chicken Biriyani", price: 120, veg: false, category: "Biriyani" },
  { id: "veg-biriyani", name: "Veg Biriyani", price: 65, veg: true, category: "Biriyani" },
  { id: "gobi-rice", name: "Gobi Fried Rice", price: 90, veg: true, category: "Rice" },
  { id: "egg-fried-rice", name: "Egg Fried Rice", price: 85, veg: false, category: "Rice" },
  { id: "chicken-65", name: "Chicken 65", price: 100, veg: false, category: "Snacks" },
  { id: "gobi-65", name: "Gobi 65", price: 70, veg: true, category: "Snacks" },
  { id: "masala-dosa", name: "Masala Dosa", price: 55, veg: true, category: "Breakfast" },
  { id: "sambar-rice", name: "Sambar Rice", price: 50, veg: true, category: "Rice" },
  { id: "grill-chicken-half", name: "Grill Chicken Half", price: 180, veg: false, category: "Grill" },
  { id: "egg-noodles", name: "Egg Noodles", price: 100, veg: false, category: "Noodles" },
  { id: "cold-coffee", name: "Cold Coffee", price: 45, veg: true, category: "Drinks" },
];

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    app: "Campus Bites",
    persistence: "Firebase Auth + Firestore",
  });
});

app.get("/api/menu", (_req, res) => {
  res.json(menuItems);
});

app.get("/api/schema", (_req, res) => {
  res.json({
    sourceOfTruth: "Firestore",
    auth: "Firebase Authentication with Google provider",
    uidKey: "request.auth.uid",
    collections: {
      users: "users/{uid}",
      orders: "orders/{uid}/history/{orderId}",
      favorites: "favorites/{uid}",
      cart: "cart/{uid}",
      notifications: "notifications/{uid}",
      settings: "settings/{uid}",
    },
  });
});

const distDir = path.join(__dirname, "../dist");
const legacyPublicDir = path.join(__dirname, "../public");
const staticDir = fs.existsSync(path.join(distDir, "index.html")) ? distDir : legacyPublicDir;

app.use(express.static(staticDir));

app.get("*", (_req, res) => {
  const indexFile = path.join(staticDir, "index.html");
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
    return;
  }

  res.status(404).send("Build the React app with npm run build first.");
});

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Campus Bites server running at http://localhost:${PORT}`);
  });
}
