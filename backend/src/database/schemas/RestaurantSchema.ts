import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurantDocument extends Document {
  name: string;
  address: string;
  ownerId: string;
  isOpen: boolean;
  menu: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
  }[];
}

const RestaurantSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  ownerId: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  menu: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true }
  }]
}, { timestamps: true });

export const RestaurantModel = mongoose.model<IRestaurantDocument>('Restaurant', RestaurantSchema);
