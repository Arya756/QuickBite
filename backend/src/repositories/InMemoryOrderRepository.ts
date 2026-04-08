import { Order } from '../models/Order';
import { IOrderRepository } from '../interfaces/IRepositories';

export class InMemoryOrderRepository implements IOrderRepository {
  private _orders: Map<string, Order> = new Map();

  public async findById(id: string): Promise<Order | null> {
    return this._orders.get(id) || null;
  }

  public async save(order: Order): Promise<Order> {
    this._orders.set(order.id, order);
    return order;
  }

  public async findAll(): Promise<Order[]> {
    return Array.from(this._orders.values());
  }

  public async update(order: Order): Promise<Order> {
    this._orders.set(order.id, order);
    return order;
  }

  public async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this._orders.values()).filter(order => order.customerId === customerId);
  }
}
