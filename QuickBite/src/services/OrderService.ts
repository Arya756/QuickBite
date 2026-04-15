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
    const order = await this.repo.findById(orderId);
    if (order && order.payment && order.payment.method) {
      throw new Error("Cannot add items to a paid order");
    }
    if (!order) throw new Error("Order not found");

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