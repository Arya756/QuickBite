import { IPaymentRepository } from '../interfaces/IRepositories';
import { Payment } from '../models/Payment';
import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema({
  amount: Number,
  status: String,
  orderId: String,
  timestamp: { type: Date, default: Date.now }
});

const PaymentModel = mongoose.model('Payment', PaymentSchema);

export class MongoPaymentRepository implements IPaymentRepository {
  
  private mapToDomain(doc: any): Payment {
    return new Payment(doc._id.toString(), doc.orderId, doc.amount, doc.status);
  }

  public async findById(id: string): Promise<Payment | null> {
    const doc = await PaymentModel.findById(id);
    return doc ? this.mapToDomain(doc) : null;
  }

  public async save(payment: Payment): Promise<Payment> {
    const data = {
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status
    };

    let doc;
    if (payment.id && payment.id.length === 24) {
      doc = await PaymentModel.findByIdAndUpdate(payment.id, data, { new: true, upsert: true });
    } else {
      doc = await PaymentModel.create(data);
    }

    return this.mapToDomain(doc);
  }

  public async findByOrderId(orderId: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({ orderId });
    return doc ? this.mapToDomain(doc) : null;
  }
}
