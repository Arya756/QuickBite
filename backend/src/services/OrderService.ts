import { Order } from '../models/Order';
import { OrderStatus } from '../interfaces/enums';
import { IOrderRepository } from '../interfaces/IRepositories';

export class OrderService {
  private _orderRepository: IOrderRepository;

  constructor(orderRepository: IOrderRepository) {
    this._orderRepository = orderRepository;
  }

  public async createOrder(customerId: string, restaurantId: string): Promise<Order> {
    const orderId = `ORD-${Date.now()}`;
    const order = new Order(orderId, customerId, restaurantId);
    return await this._orderRepository.save(order);
  }

  public async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this._orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    this.validateTransition(order.status, newStatus);
    
    order.status = newStatus;
    return await this._orderRepository.update(order);
  }

  private validateTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Cannot transition to the same status
    if (currentStatus === newStatus) {
      throw new Error(`Order is already in ${currentStatus} status`);
    }

    // Standard sequential lifecycle transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // Terminal state
      [OrderStatus.CANCELLED]: []  // Terminal state
    };

    const allowedNextStatuses = validTransitions[currentStatus];

    if (!allowedNextStatuses.includes(newStatus)) {
      throw new Error(`Invalid transition: Cannot move order from ${currentStatus} to ${newStatus}`);
    }
  }

  public async getOrderDetails(orderId: string): Promise<Order> {
    const order = await this._orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    return order;
  }
}
