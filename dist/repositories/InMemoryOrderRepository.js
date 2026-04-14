"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryOrderRepository {
    constructor() {
        this.orders = [];
    }
    save(order) {
        this.orders.push(order);
    }
    findById(id) {
        return this.orders.find(order => order.id === id) || null;
    }
}
exports.default = InMemoryOrderRepository;
