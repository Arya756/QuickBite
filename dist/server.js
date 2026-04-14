"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("./config/db"));
const MongoOrderRepository_1 = __importDefault(require("./repositories/MongoOrderRepository"));
const OrderService_1 = __importDefault(require("./services/OrderService"));
const UserModel_1 = __importDefault(require("./db/UserModel"));
const MenuRepository_1 = __importDefault(require("./repositories/MenuRepository"));
const MenuService_1 = __importDefault(require("./services/MenuService"));
const UpiPayment_1 = __importDefault(require("./strategies/UpiPayment"));
const CardPayment_1 = __importDefault(require("./strategies/CardPayment"));
const AuthMiddleware_1 = require("./middleware/AuthMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, db_1.default)();
const repo = new MongoOrderRepository_1.default();
const service = new OrderService_1.default(repo);
const menuRepo = new MenuRepository_1.default();
const menuService = new MenuService_1.default(menuRepo);
const JWT_SECRET = process.env.JWT_SECRET || 'secret_quickbite_key_2026';
// AUTH ROUTES
app.post("/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await UserModel_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: "CUSTOMER"
        });
        const { password: _password, ...safeUser } = user.toObject();
        res.status(201).json(safeUser);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel_1.default.findOne({ email }).select("+password");
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// CREATE ORDER
app.post("/orders", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("CUSTOMER"), async (req, res) => {
    try {
        const order = await service.createOrder(req.user.id);
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ADD ITEM
app.post("/orders/:id/items", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("CUSTOMER"), async (req, res) => {
    try {
        const orderId = req.params.id;
        const { itemId } = req.body;
        const order = await service.addItem(orderId, itemId, req.user);
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// PAYMENT
app.post("/orders/:id/pay", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("CUSTOMER"), async (req, res) => {
    try {
        const { method } = req.body;
        if (!method) {
            throw new Error("Payment method required");
        }
        let strategy;
        if (method === "UPI")
            strategy = new UpiPayment_1.default();
        else if (method === "CARD")
            strategy = new CardPayment_1.default();
        else
            throw new Error("Invalid payment method");
        const orderId = req.params.id;
        const order = await service.processPayment(orderId, strategy, req.user);
        ;
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// MENU ROUTES
app.post("/menu", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("ADMIN"), async (req, res) => {
    try {
        const item = await menuService.addItem(req.body);
        res.json(item);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.delete("/menu/:id", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("ADMIN"), async (req, res) => {
    try {
        const id = req.params.id;
        const item = await menuService.deleteItem(id);
        res.json(item);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET ORDER
app.get("/orders/mine", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("CUSTOMER"), async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error("User not authenticated correctly");
        }
        const orders = await service.getUserOrders(req.user.id);
        res.json(orders);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.get("/orders/:id", AuthMiddleware_1.verifyToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await service.getOrder(orderId, req.user);
        ;
        if (!order)
            return res.status(404).json({ error: "Order not found" });
        res.json(order);
    }
    catch (err) {
        res.status(403).json({ error: err.message });
    }
});
app.get("/orders", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("ADMIN"), async (req, res) => {
    const orders = await repo.getAll();
    res.json(orders);
});
// GET MENU
app.get("/menu", AuthMiddleware_1.verifyToken, async (req, res) => {
    try {
        const items = await menuService.getAllItems();
        res.json(items);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// UPDATE STATUS
app.patch("/orders/:id/status", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("ADMIN"), async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await service.updateStatus(orderId, req.body.status, req.user);
        ;
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// UPDATE ITEM QUANTITY
app.patch("/orders/:id/items/:index", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("CUSTOMER"), async (req, res) => {
    try {
        const id = req.params.id;
        const index = Number(req.params.index);
        const { action } = req.body;
        const order = await service.updateItemQuantity(id, index, action, req.user);
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// REMOVE ITEM
app.delete("/orders/:id/items/:index", AuthMiddleware_1.verifyToken, (0, AuthMiddleware_1.authorize)("CUSTOMER"), async (req, res) => {
    try {
        const id = req.params.id;
        const index = Number(req.params.index);
        const order = await service.removeItem(id, index, req.user);
        res.json(order);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
