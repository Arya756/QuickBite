import { IPaymentStrategy, PaymentDetails } from '../IPaymentStrategy';
import { PaymentStatus } from '../../../interfaces/enums';

export class CardPayment implements IPaymentStrategy {
  public async processPayment(details: PaymentDetails): Promise<{ status: PaymentStatus, transactionId: string }> {
    console.log(`Processing Card Payment for order ${details.orderId} of amount ${details.amount}`);
    // Mocking card processing logic
    const transactionId = `CARD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return { status: PaymentStatus.COMPLETED, transactionId };
  }
}

export class UpiPayment implements IPaymentStrategy {
  public async processPayment(details: PaymentDetails): Promise<{ status: PaymentStatus, transactionId: string }> {
    console.log(`Processing UPI Payment for order ${details.orderId} of amount ${details.amount}`);
    // Mocking UPI processing logic
    const transactionId = `UPI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return { status: PaymentStatus.COMPLETED, transactionId };
  }
}

export class CashOnDelivery implements IPaymentStrategy {
  public async processPayment(details: PaymentDetails): Promise<{ status: PaymentStatus, transactionId: string }> {
    console.log(`Setting up Cash on Delivery for order ${details.orderId}`);
    // For COD, payment is PENDING until delivery
    const transactionId = `COD-${details.orderId}`;
    return { status: PaymentStatus.PENDING, transactionId };
  }
}
