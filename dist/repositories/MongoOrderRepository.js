"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrderModel_1 = __importDefault(require("../db/OrderModel"));
class MongoOrderRepository {
    async create(order) {
        return await OrderModel_1.default.create(order);
    }
    async findById(id) {
        return await OrderModel_1.default.findById(id);
    }
    async update(id, updateData) {
        return await OrderModel_1.default.findByIdAndUpdate(id, updateData, { new: true });
    }
    async getAll() {
        return await OrderModel_1.default.find().sort({ _id: -1 });
    }
    async findByUserId(userId, limit = 20) {
        return await OrderModel_1.default.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    }
}
exports.default = MongoOrderRepository;
