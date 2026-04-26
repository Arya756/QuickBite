import Order from "../models/Order";
import { OrderRepository } from "../repositories/OrderRepository";
import { PaymentStrategy } from "../interfaces/PaymentStrategy";
import UserObserver from "../observers/UserObserver";
import MenuItem from "../db/MenuItemModel";


class OrderService {
  constructor(private repo: any) { }

  async createOrder(userId: string) {
    return await this.repo.create({
      userId,
      items: [],
      status: "CREATED"
    });
  }

  async addItem(
    orderId: string,
    itemId: string,
    requestingUser: { id: string; role: string }
  ) {
    // Null check FIRST, then paid check
    const order = await this.repo.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.payment && order.payment.method) {
      throw new Error("Cannot add items to a paid order");
    }

    // Role check
    if (requestingUser.role !== "CUSTOMER") {
      throw new Error("Only customers can add items to orders");
    }

    // Ownership check
    if (order.userId.toString() !== requestingUser.id) {
      throw new Error("Access denied: You do not own this order");
    }

    // Fetching item from DB
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) throw new Error("Menu item not found");

    // Check if item already exists in the order
    const itemIndex = order.items.findIndex((i: any) => i.name === menuItem.name);
    let updatedItems = [...order.items];

    if (itemIndex > -1) {
      // Increment quantity
      const existingItem = (order.items[itemIndex] as any).toObject();
      updatedItems[itemIndex] = {
        ...existingItem,
        quantity: (existingItem.quantity || 1) + 1
      };
    } else {
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

  async updateItemQuantity(
    orderId: string,
    index: number,
    action: "INCREMENT" | "DECREMENT",
    requestingUser: { id: string; role: string }
  ) {
    const order = await this.repo.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (requestingUser.role !== "CUSTOMER") {
      throw new Error("Only customers can modify orders");
    }

    if (order.userId.toString() !== requestingUser.id) {
      throw new Error("Access denied");
    }

    if (order.payment && order.payment.method) {
      throw new Error("Cannot modify a paid order");
    }

    if (isNaN(index) || index < 0 || index >= order.items.length) {
      throw new Error("Invalid item index");
    }

    let updatedItems = [...order.items];
    const currentItem = (order.items[index] as any).toObject();

    if (action === "INCREMENT") {
      updatedItems[index] = {
        ...currentItem,
        quantity: (currentItem.quantity || 1) + 1
      };
    } else if (action === "DECREMENT") {
      const newQuantity = (currentItem.quantity || 1) - 1;
      if (newQuantity <= 0) {
        updatedItems.splice(index, 1);
      } else {
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

  async removeItem(
    orderId: string,
    index: number,
    requestingUser: { id: string; role: string }
  ) {
    const order = await this.repo.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (requestingUser.role !== "CUSTOMER") {
      throw new Error("Only customers can modify orders");
    }

    if (order.userId.toString() !== requestingUser.id) {
      throw new Error("Access denied");
    }

    if (order.payment && order.payment.method) {
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

  async processPayment(
    orderId: string,
    strategy: PaymentStrategy,
    requestingUser: { id: string; role: string },
    methodName: string   // Use explicit string instead of class name
  ) {
    const orderData: any = await this.repo.findById(orderId);

    if (!orderData) throw new Error("Order not found");

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

    const order = new Order(orderData.userId.toString());
    order.items = orderData.items || [];
    order.status = orderData.status;
    order.notifications = orderData.notifications || [];

    order.addObserver(new UserObserver());

    const total = order.getTotalAmount();
    strategy.pay(total);

    const message = `✅ Order paid via ${methodName} — ₹${total.toFixed(2)}`;
    order.notifyObservers(message);

    return await this.repo.update(orderId, {
      payment: {
        amount: total,
        method: methodName  // Clean string, not class name
      },
      status: "PAID",
      notifications: order.notifications
    });
  }

  async updateStatus(orderId: string, newStatus: string, requestingUser: { id: string; role: string }) {
    if (requestingUser.role !== 'ADMIN') {
      throw new Error("Access denied: Only admins can update order status");
    }

    const orderData: any = await this.repo.findById(orderId);
    if (!orderData) throw new Error("Order not found");

    const order = new Order(orderData.userId.toString());
    order.items = orderData.items || [];
    order.status = orderData.status;
    order.notifications = orderData.notifications || [];

    order.addObserver(new UserObserver());

    const validTransitions: Record<string, string[]> = {
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
    order.notifyObservers(`📦 Your order is now: ${newStatus}`);

    return await this.repo.update(orderId, {
      status: newStatus,
      notifications: order.notifications
    });
  }

  async getOrder(orderId: string, requestingUser: { id: string; role: string }) {
    const order = await this.repo.findById(orderId);
    if (!order) return null;

    if (requestingUser.role === 'CUSTOMER' && order.userId.toString() !== requestingUser.id) {
      throw new Error("Access denied: You do not own this order");
    }

    return order;
  }

  async getUserOrders(userId: string) {
    if (!userId) throw new Error("User ID is required");
    return await this.repo.findByUserId(userId);
  }
}

export default OrderService;