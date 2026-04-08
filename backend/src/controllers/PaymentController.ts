import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { CardPayment, UpiPayment, CashOnDelivery } from '../services/payment/strategies/PaymentStrategies';

export class PaymentController {
  private _paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this._paymentService = paymentService;
  }

  public async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, amount, method } = req.body;
      
      let strategy;
      switch (method) {
        case 'CARD':
          strategy = new CardPayment();
          break;
        case 'UPI':
          strategy = new UpiPayment();
          break;
        case 'COD':
          strategy = new CashOnDelivery();
          break;
        default:
          throw new Error("Unsupported payment method");
      }

      const result = await this._paymentService.processOrderPayment({ orderId, amount }, strategy);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
