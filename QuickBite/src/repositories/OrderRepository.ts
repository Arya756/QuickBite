import Order from "../models/Order";

export interface OrderRepository {
  save(order: Order): void;
  findById(id: number): Order | null;
}