import { Payment } from '../models/Payment';
import { IPaymentRepository } from '../interfaces/IRepositories';

export class InMemoryPaymentRepository implements IPaymentRepository {
  private _payments: Map<string, Payment> = new Map();

  public async findById(id: string): Promise<Payment | null> {
    return this._payments.get(id) || null;
  }

  public async save(payment: Payment): Promise<Payment> {
    this._payments.set(payment.id, payment);
    return payment;
  }
}
