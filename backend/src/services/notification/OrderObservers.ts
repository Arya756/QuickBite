import { IObserver } from '../../interfaces/INotification';
import { OrderStatus } from '../../interfaces/enums';

export class CustomerObserver implements IObserver {
  private _customerId: string;

  constructor(customerId: string) {
    this._customerId = customerId;
  }

  public update(orderId: string, status: OrderStatus): void {
    console.log(`[Push Notification to Customer ${this._customerId}]: 
      Order ${orderId} status changed to ${status}`);
    // Future: this._pushService.send(...)
  }
}

export class RestaurantOwnerObserver implements IObserver {
  private _restaurantId: string;

  constructor(restaurantId: string) {
    this._restaurantId = restaurantId;
  }

  public update(orderId: string, status: OrderStatus): void {
    console.log(`[Dashboard Update for Restaurant ${this._restaurantId}]: 
      New Update for Order ${orderId}: ${status}`);
    // Future: this._socketService.emit(...)
  }
}

export class EmailNotificationObserver implements IObserver {
  private _email: string;

  constructor(email: string) {
    this._email = email;
  }

  public update(orderId: string, status: OrderStatus): void {
    console.log(`[Email Sent to ${this._email}]: 
      Your order ${orderId} is now ${status}`);
  }
}
