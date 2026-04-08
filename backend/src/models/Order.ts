import { MenuItem } from './MenuItem';
import { OrderStatus } from '../interfaces/enums';
import { ISubject, IObserver } from '../interfaces/INotification';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  priceAtOrder: number;
}

export class Order implements ISubject {
  private _id: string;
  private _customerId: string;
  private _restaurantId: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _orderDate: Date;
  private _totalAmount: number;
  private _observers: IObserver[] = [];

  constructor(id: string, customerId: string, restaurantId: string) {
    this._id = id;
    this._customerId = customerId;
    this._restaurantId = restaurantId;
    this._items = [];
    this._status = OrderStatus.CREATED;
    this._orderDate = new Date();
    this._totalAmount = 0;
  }

  // ISubject Implementation
  public subscribe(observer: IObserver): void {
    if (!this._observers.includes(observer)) {
      this._observers.push(observer);
    }
  }

  public unsubscribe(observer: IObserver): void {
    this._observers = this._observers.filter(obs => obs !== observer);
  }

  public notify(orderId: string, status: OrderStatus): void {
    this._observers.forEach(observer => observer.update(orderId, status));
  }

  public get id(): string {
    return this._id;
  }

  public get customerId(): string {
    return this._customerId;
  }

  public get restaurantId(): string {
    return this._restaurantId;
  }

  public get items(): OrderItem[] {
    return [...this._items];
  }

  public get status(): OrderStatus {
    return this._status;
  }

  public set status(value: OrderStatus) {
    const oldStatus = this._status;
    this._status = value;
    if (oldStatus !== value) {
      this.notify(this._id, value);
    }
  }

  public get orderDate(): Date {
    return this._orderDate;
  }

  public get totalAmount(): number {
    return this._totalAmount;
  }

  public addItem(item: MenuItem, quantity: number): void {
    const orderItem: OrderItem = {
      menuItem: item,
      quantity: quantity,
      priceAtOrder: item.price
    };
    this._items.push(orderItem);
    this.calculateTotal();
  }

  private calculateTotal(): void {
    this._totalAmount = this._items.reduce(
      (sum, item) => sum + (item.priceAtOrder * item.quantity), 
      0
    );
  }
}
