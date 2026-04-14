"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrderSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
OrderSchema.virtual('totalPrice').get(function () {
    return (this.items || []).reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
});
exports.default = mongoose_1.default.model("Order", OrderSchema);
