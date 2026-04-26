import type Observer from "../interfaces/Observer";
import type { PaymentStrategy } from "../interfaces/PaymentStrategy";
import MenuItem from "./MenuItem";
import Payment from "./Payment";

class Order {
  id: string;
  status: string;
  observers: Observer[] = [];
  items: MenuItem[] = [];
  paymentStrategy: PaymentStrategy | null = null;
  payment: Payment | null = null;
  notifications: string[];

  constructor(userId: string) {
    this.id = userId;
    this.items = [];
    this.status = "CREATED";
    this.observers = [];
    this.notifications = [];
  }

  addItem(item: MenuItem) {
    if (!item) {
      throw new Error("Invalid item");
    }
    this.items.push(item);
  }

  getTotalAmount(): number {
    return this.items.reduce((total, item: any) => total + (item.price * (item.quantity || 1)), 0);
  }

  addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  setPaymentStrategy(strategy: PaymentStrategy) {
    this.paymentStrategy = strategy;
  }

  processPayment() {
    if (!this.paymentStrategy) {
      throw new Error("Payment method not selected");
    }
    const amount = this.getTotalAmount();
    this.paymentStrategy.pay(amount);
    this.payment = new Payment(amount, this.paymentStrategy.constructor.name);
  }

  notifyObservers(status: string) {
    this.observers.forEach(observer => observer.update(this, status));
  }

  // Aligned with the service state machine transitions
  updateStatus(newStatus: string) {
    const validStatuses = [
      "CREATED",
      "PAID",
      "ACCEPTED",
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

export default Order;