class Payment {
  amount: number;
  method: string;

  constructor(amount: number, method: string) {
    this.amount = amount;
    this.method = method;
  }
}

export default Payment;