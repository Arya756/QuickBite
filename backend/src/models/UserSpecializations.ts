import { User } from './User';
import { UserRole } from '../interfaces/enums';

export class Customer extends User {
  private _address: string;
  private _phoneNumber: string;

  constructor(id: string, email: string, firstName: string, lastName: string, address: string, phoneNumber: string) {
    super(id, email, firstName, lastName, UserRole.CUSTOMER);
    this._address = address;
    this._phoneNumber = phoneNumber;
  }

  public get address(): string {
    return this._address;
  }

  public set address(value: string) {
    this._address = value;
  }

  public get phoneNumber(): string {
    return this._phoneNumber;
  }

  public set phoneNumber(value: string) {
    this._phoneNumber = value;
  }
}

export class Admin extends User {
  constructor(id: string, email: string, firstName: string, lastName: string) {
    super(id, email, firstName, lastName, UserRole.ADMIN);
  }
}

export class RestaurantOwner extends User {
  private _restaurantIds: string[];

  constructor(id: string, email: string, firstName: string, lastName: string) {
    super(id, email, firstName, lastName, UserRole.RESTAURANT_OWNER);
    this._restaurantIds = [];
  }

  public get restaurantIds(): string[] {
    return [...this._restaurantIds];
  }

  public addRestaurant(restaurantId: string): void {
    if (!this._restaurantIds.includes(restaurantId)) {
      this._restaurantIds.push(restaurantId);
    }
  }
}
