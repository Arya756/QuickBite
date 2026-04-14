"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_1 = __importDefault(require("./Payment"));
class Order {
    constructor(userId) {
        this.observers = [];
        this.items = [];
        this.paymentStrategy = null;
        this.payment = null;
        this.id = userId;
        this.items = [];
        this.status = "CREATED";
        this.observers = [];
        this.notifications = [];
    }
    addItem(item) {
        if (!item) {
            throw new Error("Invalid item");
        }
        this.items.push(item);
    }
    getTotalAmount() {
        return this.items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    setPaymentStrategy(strategy) {
        this.paymentStrategy = strategy;
    }
    processPayment() {
        if (!this.paymentStrategy) {
            throw new Error("Payment method not selected");
        }
        const amount = this.getTotalAmount();
        this.paymentStrategy.pay(amount);
        this.payment = new Payment_1.default(amount, this.paymentStrategy.constructor.name);
    }
    notifyObservers(status) {
        this.observers.forEach(observer => observer.update(this, status));
    }
    updateStatus(newStatus) {
        const validStatuses = [
            "CREATED",
            "PREPARING",
            "DELIVERED",
            "CANCELLED"
        ];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Invalid order status");
        }
        this.status = newStatus;
        this.notifyObservers(newStatus);
    }
}
exports.default = Order;
