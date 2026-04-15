import type {PaymentStrategy} from "../interfaces/PaymentStrategy";

class CardPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log("Paid using Card: " + amount);
  }
}

export default CardPayment;