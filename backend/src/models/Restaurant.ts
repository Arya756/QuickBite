import { MenuItem } from './MenuItem';

export class Restaurant {
  private _id: string;
  private _name: string;
  private _address: string;
  private _ownerId: string;
  private _menu: MenuItem[];
  private _isOpen: boolean;

  constructor(id: string, name: string, address: string, ownerId: string) {
    this._id = id;
    this._name = name;
    this._address = address;
    this._ownerId = ownerId;
    this._menu = [];
    this._isOpen = true;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get address(): string {
    return this._address;
  }

  public set address(value: string) {
    this._address = value;
  }

  public get ownerId(): string {
    return this._ownerId;
  }

  public get menu(): MenuItem[] {
    return [...this._menu];
  }

  public addMenuItem(item: MenuItem): void {
    this._menu.push(item);
  }

  public removeMenuItem(itemId: string): void {
    this._menu = this._menu.filter(item => item.id !== itemId);
  }

  public get isOpen(): boolean {
    return this._isOpen;
  }

  public set isOpen(value: boolean) {
    this._isOpen = value;
  }

  public toJSON() {
    return {
      id: this._id,
      name: this._name,
      address: this._address,
      ownerId: this._ownerId,
      menu: this._menu,
      isOpen: this._isOpen
    };
  }
}
