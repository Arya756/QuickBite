import { IPaymentRepository } from '../interfaces/IRepositories';
import { Payment } from '../models/Payment';
import { PaymentContext } from './payment/PaymentContext';
import { PaymentDetails, IPaymentStrategy } from './payment/IPaymentStrategy';

export class PaymentService {
  private _paymentRepository: IPaymentRepository;
  private _paymentContext: PaymentContext;

  constructor(paymentRepository: IPaymentRepository, initialStrategy: IPaymentStrategy) {
    this._paymentRepository = paymentRepository;
    this._paymentContext = new PaymentContext(initialStrategy);
  }

  public async processOrderPayment(details: PaymentDetails, strategy?: IPaymentStrategy): Promise<Payment> {
    if (strategy) {
      this._paymentContext.setStrategy(strategy);
    }

    const result = await this._paymentContext.executePayment(details);
    
    const payment = new Payment(
      `PAY-${Date.now()}`,
      details.orderId,
      details.amount,
      result.transactionId
    );
    payment.status = result.status;

    return await this._paymentRepository.save(payment);
  }
}
