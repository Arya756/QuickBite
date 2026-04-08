import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

export class OrderController {
  private _orderService: OrderService;

  constructor(orderService: OrderService) {
    this._orderService = orderService;
  }

  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, restaurantId } = req.body;
      const order = await this._orderService.createOrder(customerId, restaurantId);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, newStatus } = req.body;
      const updatedOrder = await this._orderService.updateOrderStatus(orderId, newStatus);
      res.status(200).json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await this._orderService.getOrderDetails(req.params.id as string);
      res.status(200).json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
