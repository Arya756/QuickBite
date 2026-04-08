import { PaymentStatus } from '../interfaces/enums';

export class Payment {
  private _id: string;
  private _orderId: string;
  private _amount: number;
  private _status: PaymentStatus;
  private _paymentDate: Date;
  private _transactionId: string;

  constructor(id: string, orderId: string, amount: number, transactionId: string) {
    this._id = id;
    this._orderId = orderId;
    this._amount = amount;
    this._transactionId = transactionId;
    this._status = PaymentStatus.PENDING;
    this._paymentDate = new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get orderId(): string {
    return this._orderId;
  }

  public get amount(): number {
    return this._amount;
  }

  public get status(): PaymentStatus {
    return this._status;
  }

  public set status(value: PaymentStatus) {
    this._status = value;
  }

  public get paymentDate(): Date {
    return this._paymentDate;
  }

  public get transactionId(): string {
    return this._transactionId;
  }
}
