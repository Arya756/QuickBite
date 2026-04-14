import type {PaymentStrategy} from "../interfaces/PaymentStrategy";

class UpiPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log("Paid using UPI: " + amount);
  }
}

export default UpiPayment;