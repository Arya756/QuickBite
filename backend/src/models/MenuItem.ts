export class MenuItem {
  private _id: string;
  private _name: string;
  private _description: string;
  private _price: number;
  private _isAvailable: boolean;
  private _imageUrl: string;

  constructor(id: string, name: string, description: string, price: number, imageUrl: string) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._price = price;
    this._imageUrl = imageUrl;
    this._isAvailable = true;
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

  public get description(): string {
    return this._description;
  }

  public set description(value: string) {
    this._description = value;
  }

  public get price(): number {
    return this._price;
  }

  public set price(value: number) {
    if (value < 0) throw new Error("Price cannot be negative");
    this._price = value;
  }

  public get isAvailable(): boolean {
    return this._isAvailable;
  }

  public set isAvailable(value: boolean) {
    this._isAvailable = value;
  }

  public get imageUrl(): string {
    return this._imageUrl;
  }

  public set imageUrl(value: string) {
    this._imageUrl = value;
  }

  public toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      isAvailable: this._isAvailable,
      imageUrl: this._imageUrl
    };
  }
}
