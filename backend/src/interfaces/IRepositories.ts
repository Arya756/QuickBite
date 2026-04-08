import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<any>; // Returns document with password
  save(user: User): Promise<User>;
}

export interface IRestaurantRepository {
  findById(id: string): Promise<Restaurant | null>;
  findAll(): Promise<Restaurant[]>;
  save(restaurant: Restaurant): Promise<Restaurant>;
  search(query: string): Promise<Restaurant[]>;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  save(payment: Payment): Promise<Payment>;
  findByOrderId(orderId: string): Promise<Payment | null>;
}
