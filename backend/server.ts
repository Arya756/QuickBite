import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "./config/db";

import MongoOrderRepository from "./repositories/MongoOrderRepository";
import OrderService from "./services/OrderService";
import UserModel from "./db/UserModel";
import MenuItem from "./db/MenuItemModel";
import MenuRepository from "./repositories/MenuRepository";
import MenuService from "./services/MenuService";
import UpiPayment from "./strategies/UpiPayment";
import CardPayment from "./strategies/CardPayment";
import { verifyToken, authorize, AuthRequest } from "./middleware/AuthMiddleware";
import { Request, Response } from "express";

dotenv.config();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow any localhost origin for local development
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 port in dev
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Allow explicitly configured prod origin
    const prodOrigin = process.env.FRONTEND_URL;
    if (prodOrigin && origin === prodOrigin) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());

connectDB();

const repo = new MongoOrderRepository();
const service = new OrderService(repo);

const menuRepo = new MenuRepository();
const menuService = new MenuService(menuRepo);

const JWT_SECRET = process.env.JWT_SECRET || "secret_quickbite_key_2026";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────

// Health check — used to verify server is reachable
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check for duplicate email
    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "CUSTOMER"
    });

    const { password: _password, ...safeUser } = user.toObject();
    res.status(201).json(safeUser);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    res.status(400).json({ error: err.message });
  }
});

// Admin signup — requires ADMIN_SECRET header to create an admin account
app.post("/auth/admin-signup", async (req, res) => {
  try {
    const adminSecret = process.env.ADMIN_SECRET || "quickbite-admin-2026";
    const providedSecret = req.headers["x-admin-secret"] as string;

    if (!providedSecret || providedSecret !== adminSecret) {
      return res.status(403).json({ error: "Invalid admin secret." });
    }

    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "ADMIN"
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    res.status(400).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


// ── ORDER ROUTES ──────────────────────────────────────────────────────────────

// CREATE ORDER
app.post("/orders", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res) => {
  try {
    const order = await service.createOrder(req.user!.id);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ADD ITEM
app.post("/orders/:id/items", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id as string;
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId is required" });

    const order = await service.addItem(orderId, itemId, req.user!);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PAYMENT
app.post("/orders/:id/pay", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res) => {
  try {
    const { method } = req.body;
    if (!method) throw new Error("Payment method is required.");

    let strategy;
    if (method === "UPI") strategy = new UpiPayment();
    else if (method === "CARD") strategy = new CardPayment();
    else throw new Error("Invalid payment method. Use UPI or CARD.");

    const orderId = req.params.id as string;
    // Pass method string explicitly so it's stored cleanly
    const order = await service.processPayment(orderId, strategy, req.user!, method);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET MY ORDERS
app.get("/orders/mine", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.id) throw new Error("User not authenticated correctly");
    const orders = await service.getUserOrders(req.user.id);
    res.json(orders);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET SINGLE ORDER
app.get("/orders/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id as string;
    const order = await service.getOrder(orderId, req.user!);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// GET ALL ORDERS (ADMIN)
app.get("/orders", verifyToken, authorize("ADMIN"), async (req, res) => {
  const orders = await repo.getAll();
  res.json(orders);
});

// UPDATE ORDER STATUS (ADMIN)
app.patch("/orders/:id/status", verifyToken, authorize("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id as string;
    const order = await service.updateStatus(orderId, req.body.status, req.user!);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE ITEM QUANTITY
app.patch("/orders/:id/items/:index", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const index = Number(req.params.index);
    const { action } = req.body;
    if (!["INCREMENT", "DECREMENT"].includes(action)) {
      return res.status(400).json({ error: "action must be INCREMENT or DECREMENT" });
    }
    const order = await service.updateItemQuantity(id, index, action, req.user!);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// REMOVE ITEM
app.delete("/orders/:id/items/:index", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Number(req.params.index);
    const order = await service.removeItem(id, index, req.user!);
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── MENU ROUTES ───────────────────────────────────────────────────────────────

app.get("/menu", verifyToken, async (req, res) => {
  try {
    const items = await menuService.getAllItems();
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/menu", verifyToken, authorize("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const { name, price } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Item name must be at least 2 characters." });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: "Price must be a positive number." });
    }
    const item = await menuService.addItem({ name: name.trim(), price: Number(price) });
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/menu/:id", verifyToken, authorize("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const item = await menuService.deleteItem(id);
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});