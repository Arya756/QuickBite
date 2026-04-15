import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }
  ],
  status: {
    type: String,
    default: "CREATED"
  },
  payment: {
    amount: Number,
    method: String
  },
  notifications: [String]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// Virtual for totalPrice calculation
OrderSchema.virtual('totalPrice').get(function() {
  return (this.items || []).reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
});

export default mongoose.model("Order", OrderSchema);