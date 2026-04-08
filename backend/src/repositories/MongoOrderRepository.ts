import { Order, OrderItem } from '../models/Order';
import { IOrderRepository } from '../interfaces/IRepositories';
import { OrderModel, IOrderDocument } from '../database/schemas/OrderSchema';
import { OrderStatus } from '../interfaces/enums';
import { MenuItem } from '../models/MenuItem';

export class MongoOrderRepository implements IOrderRepository {
  
  private mapToDomain(doc: IOrderDocument): Order {
    const order = new Order(
      doc._id.toString(),
      doc.customerId,
      doc.restaurantId
    );
    
    // Set status and date which are defaulted in constructor
    order.status = doc.status;
    // Note: orderDate is private and no setter, might need one if we care about stored date
    
    doc.items.forEach(item => {
      const menuItem = new MenuItem(
        item.menuItem.id,
        item.menuItem.name,
        '', // description not stored in order items
        item.menuItem.price,
        '' // imageUrl not stored
      );
      order.addItem(menuItem, item.quantity);
    });

    return order;
  }

  public async findById(id: string): Promise<Order | null> {
    const doc = await OrderModel.findById(id);
    return doc ? this.mapToDomain(doc) : null;
  }

  public async findAll(): Promise<Order[]> {
    const docs = await OrderModel.find();
    return docs.map(doc => this.mapToDomain(doc));
  }

  public async save(order: Order): Promise<Order> {
    const data = {
      customerId: order.customerId,
      restaurantId: order.restaurantId,
      items: order.items.map(item => ({
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price
        },
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder
      })),
      status: order.status,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate
    };

    let doc;
    if (order.id && order.id.length === 24) {
      doc = await OrderModel.findByIdAndUpdate(order.id, data, { new: true, upsert: true });
    } else {
      doc = await OrderModel.create(data);
    }

    return this.mapToDomain(doc);
  }

  public async update(order: Order): Promise<Order> {
    return this.save(order);
  }

  public async findByCustomerId(customerId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ customerId });
    return docs.map(doc => this.mapToDomain(doc));
  }
}
