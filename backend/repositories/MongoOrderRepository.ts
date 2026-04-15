import OrderModel from "../db/OrderModel";

class MongoOrderRepository {

  async create(order: any) {
    return await OrderModel.create(order);
  }

  async findById(id: string) {
    return await OrderModel.findById(id);
  }

  async update(id: string, updateData: any) {
    return await OrderModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getAll() {
    return await OrderModel.find().sort({ _id: -1 });
  }

  async findByUserId(userId: string, limit: number = 20) {
    return await OrderModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

}

export default MongoOrderRepository;