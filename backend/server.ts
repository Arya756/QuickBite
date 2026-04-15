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
app.use(cors());
app.use(express.json());

connectDB();

const repo = new MongoOrderRepository();
const service = new OrderService(repo);

const menuRepo = new MenuRepository();
const menuService = new MenuService(menuRepo);

const JWT_SECRET = process.env.JWT_SECRET || 'secret_quickbite_key_2026';

// AUTH ROUTES
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: "CUSTOMER"
    });
    const { password: _password, ...safeUser } = user.toObject();
    res.status(201).json(safeUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

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
app.post("/orders/:id/items",
  verifyToken,
  authorize("CUSTOMER"),
  async (req: AuthRequest, res) => {
    try {
      const orderId = req.params.id as string;
      const { itemId } = req.body;

      const order = await service.addItem(orderId, itemId, req.user!);
      res.json(order);

    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PAYMENT
app.post("/orders/:id/pay", verifyToken, authorize("CUSTOMER"), async (req: AuthRequest, res) => {
  try {
    const { method } = req.body;
    if (!method) {
      throw new Error("Payment method required");
    }
    let strategy;

    if (method === "UPI") strategy = new UpiPayment();
    else if (method === "CARD") strategy = new CardPayment();
    else throw new Error("Invalid payment method");

    const orderId = req.params.id as string;
    const order = await service.processPayment(orderId, strategy, req.user!);;
    res.json(order);

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
// MENU ROUTES
app.post("/menu",
  verifyToken,
  authorize("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const item = await menuService.addItem(req.body);
      res.json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.delete("/menu/:id",
  verifyToken,
  authorize("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const item = await menuService.deleteItem(id);
      res.json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);


// GET ORDER
app.get("/orders/mine",
  verifyToken,
  authorize("CUSTOMER"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.id) {
        throw new Error("User not authenticated correctly");
      }
      const orders = await service.getUserOrders(req.user.id);
      res.json(orders);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.get("/orders/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id as string;
    const order = await service.getOrder(orderId, req.user!);;
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

app.get("/orders",
  verifyToken,
  authorize("ADMIN"),
  async (req, res) => {
    const orders = await repo.getAll();
    res.json(orders);
  }
);

// GET MENU
app.get("/menu", verifyToken, async (req, res) => {
  try {
    const items = await menuService.getAllItems();
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE STATUS
app.patch("/orders/:id/status", verifyToken, authorize("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const orderId = req.params.id as string;
    const order = await service.updateStatus(orderId, req.body.status, req.user!);;
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
// UPDATE ITEM QUANTITY
app.patch("/orders/:id/items/:index",
  verifyToken,
  authorize("CUSTOMER"),
  async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const index = Number(req.params.index);
      const { action } = req.body;

      const order = await service.updateItemQuantity(id, index, action, req.user!);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// REMOVE ITEM
app.delete(
  "/orders/:id/items/:index",
  verifyToken,
  authorize("CUSTOMER"),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const index = Number(req.params.index);

      const order = await service.removeItem(id, index, req.user!);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});