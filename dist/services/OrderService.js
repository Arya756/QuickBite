"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = __importDefault(require("../models/Order"));
const UserObserver_1 = __importDefault(require("../observers/UserObserver"));
const MenuItemModel_1 = __importDefault(require("../db/MenuItemModel"));
class OrderService {
    constructor(repo) {
        this.repo = repo;
    }
    async createOrder(userId) {
        return await this.repo.create({
            userId,
            items: [],
            status: "CREATED"
        });
    }
    async addItem(orderId, itemId, requestingUser) {
        const order = await this.repo.findById(orderId);
        if (order && order.payment && order.payment.method) {
            throw new Error("Cannot add items to a paid order");
        }
        if (!order)
            throw new Error("Order not found");
        // Role check
        if (requestingUser.role !== "CUSTOMER") {
            throw new Error("Only customers can add items to orders");
        }
        // Ownership check
        if (order.userId.toString() !== requestingUser.id) {
            throw new Error("Access denied: You do not own this order");
        }
        // Fetching item from DB 
        const menuItem = await MenuItemModel_1.default.findById(itemId);
        if (!menuItem)
            throw new Error("Menu item not found");
        // Check if item already exists in the order
        const itemIndex = order.items.findIndex((i) => i.name === menuItem.name);
        let updatedItems = [...order.items];
        if (itemIndex > -1) {
            // Increment quantity
            const existingItem = order.items[itemIndex].toObject();
            updatedItems[itemIndex] = {
                ...existingItem,
                quantity: (existingItem.quantity || 1) + 1
            };
        }
        else {
            // Add new item with quantity 1
            updatedItems.push({
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1
            });
        }
        return await this.repo.update(orderId, {
            items: updatedItems
        });
    }
    async updateItemQuantity(orderId, index, action, requestingUser) {
        const order = await this.repo.findById(orderId);
        if (!order)
            throw new Error("Order not found");
        if (requestingUser.role !== "CUSTOMER") {
            throw new Error("Only customers can modify orders");
        }
        if (order.userId.toString() !== requestingUser.id) {
            throw new Error("Access denied");
        }
        if (order && order.payment && order.payment.method) {
            throw new Error("Cannot modify a paid order");
        }
        if (isNaN(index) || index < 0 || index >= order.items.length) {
            throw new Error("Invalid item index");
        }
        let updatedItems = [...order.items];
        const currentItem = order.items[index].toObject();
        if (action === "INCREMENT") {
            updatedItems[index] = {
                ...currentItem,
                quantity: (currentItem.quantity || 1) + 1
            };
        }
        else if (action === "DECREMENT") {
            const newQuantity = (currentItem.quantity || 1) - 1;
            if (newQuantity <= 0) {
                // Remove item if quantity becomes 0
                updatedItems.splice(index, 1);
            }
            else {
                updatedItems[index] = {
                    ...currentItem,
                    quantity: newQuantity
                };
            }
        }
        return await this.repo.update(orderId, {
            items: updatedItems
        });
    }
    async removeItem(orderId, index, requestingUser) {
        const order = await this.repo.findById(orderId);
        if (!order)
            throw new Error("Order not found");
        if (requestingUser.role !== "CUSTOMER") {
            throw new Error("Only customers can modify orders");
        }
        if (order.userId.toString() !== requestingUser.id) {
            throw new Error("Access denied");
        }
        if (order && order.payment && order.payment.method) {
            throw new Error("Cannot modify a paid order");
        }
        if (isNaN(index) || index < 0 || index >= order.items.length) {
            throw new Error("Invalid item index");
        }
        let updatedItems = [...order.items];
        updatedItems.splice(index, 1);
        return await this.repo.update(orderId, {
            items: updatedItems
        });
    }
    async processPayment(orderId, strategy, requestingUser) {
        const orderData = await this.repo.findById(orderId);
        if (!orderData)
            throw new Error("Order not found");
        // Ownership check
        if (orderData.userId.toString() !== requestingUser.id) {
            throw new Error("Access denied: You do not own this order");
        }
        if (requestingUser.role !== 'CUSTOMER') {
            throw new Error("Only customers can process payments");
        }
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error("Cannot process payment: No items in order");
        }
        if (orderData.payment && orderData.payment.method) {
            throw new Error("Payment already completed");
        }
        const order = new Order_1.default(orderData.userId.toString());
        order.items = orderData.items || [];
        order.status = orderData.status;
        order.notifications = orderData.notifications || [];
        order.addObserver(new UserObserver_1.default());
        const total = order.getTotalAmount();
        strategy.pay(total);
        const paymentMethod = strategy.constructor.name;
        const message = `✅ Order Paid Successfully via ${paymentMethod} (₹${total})`;
        order.notifyObservers(message);
        return await this.repo.update(orderId, {
            payment: {
                amount: total,
                method: paymentMethod
            },
            status: "PAID",
            notifications: order.notifications
        });
    }
    async updateStatus(orderId, newStatus, requestingUser) {
        if (requestingUser.role !== 'ADMIN') {
            throw new Error("Access denied: Only admins can update order status");
        }
        const orderData = await this.repo.findById(orderId);
        if (!orderData)
            throw new Error("Order not found");
        const order = new Order_1.default(orderData.userId.toString());
        order.items = orderData.items || [];
        order.status = orderData.status;
        order.notifications = orderData.notifications || [];
        order.addObserver(new UserObserver_1.default());
        const validTransitions = {
            CREATED: ["PAID"],
            PAID: ["ACCEPTED"],
            ACCEPTED: ["PREPARING"],
            PREPARING: ["DELIVERED"],
            DELIVERED: []
        };
        const current = String(order.status || "").toUpperCase();
        const next = String(newStatus || "").toUpperCase();
        if (!validTransitions[current] || !validTransitions[current].includes(next)) {
            throw new Error(`Invalid status transition from ${current} to ${next}`);
        }
        order.status = newStatus;
        order.notifyObservers(`Order is now ${newStatus}`);
        ;
        return await this.repo.update(orderId, {
            status: newStatus,
            notifications: order.notifications
        });
    }
    async getOrder(orderId, requestingUser) {
        const order = await this.repo.findById(orderId);
        if (!order)
            return null;
        // CUSTOMER ownership check
        if (requestingUser.role === 'CUSTOMER' && order.userId.toString() !== requestingUser.id) {
            throw new Error("Access denied: You do not own this order");
        }
        return order;
    }
    async getUserOrders(userId) {
        if (!userId)
            throw new Error("User ID is required");
        return await this.repo.findByUserId(userId);
    }
}
exports.default = OrderService;
