import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '../../interfaces/enums';

export interface IOrderDocument extends Document {
  customerId: string;
  restaurantId: string;
  items: {
    menuItem: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    priceAtOrder: number;
  }[];
  status: OrderStatus;
  totalAmount: number;
  orderDate: Date;
}

const OrderSchema: Schema = new Schema({
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [{
    menuItem: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }
    },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true }
  }],
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.CREATED },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);
