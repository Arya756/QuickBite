import { PaymentStatus } from '../../interfaces/enums';

export interface PaymentDetails {
  orderId: string;
  amount: number;
  transactionId?: string;
}

export interface IPaymentStrategy {
  processPayment(details: PaymentDetails): Promise<{ status: PaymentStatus, transactionId: string }>;
}
