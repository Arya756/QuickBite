import { OrderStatus } from './enums';

export interface IObserver {
  update(orderId: string, status: OrderStatus): void;
}

export interface ISubject {
  subscribe(observer: IObserver): void;
  unsubscribe(observer: IObserver): void;
  notify(orderId: string, status: OrderStatus): void;
}
