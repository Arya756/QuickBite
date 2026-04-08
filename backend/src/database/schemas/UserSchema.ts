import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN';
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['CUSTOMER', 'RESTAURANT_OWNER', 'ADMIN'], default: 'CUSTOMER' }
}, { timestamps: true });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
