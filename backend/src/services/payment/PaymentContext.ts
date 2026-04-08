import { IPaymentStrategy, PaymentDetails } from './IPaymentStrategy';
import { PaymentStatus } from '../../interfaces/enums';

export class PaymentContext {
  private _strategy: IPaymentStrategy;

  constructor(strategy: IPaymentStrategy) {
    this._strategy = strategy;
  }

  public setStrategy(strategy: IPaymentStrategy): void {
    this._strategy = strategy;
  }

  public async executePayment(details: PaymentDetails): Promise<{ status: PaymentStatus, transactionId: string }> {
    if (!this._strategy) {
      throw new Error("Payment strategy not set");
    }
    return await this._strategy.processPayment(details);
  }
}
