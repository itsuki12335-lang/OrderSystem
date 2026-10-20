import { InsufficientBalanceError } from "../errors/InsufficientBalanceError";
import { Customer } from "../models/Customer";
import { PaymentMethod } from "./PaymentMethod";
import { PaymentResult } from "./PaymentResult";
export class CardPaymentMethod implements PaymentMethod {
  readonly name: string = "CARD";
  validate(customer: Customer, amount: number): void {
    if (!customer.canAfford(amount)) {
      throw new InsufficientBalanceError(
        customer.id,
        amount,
        customer.getBalance(),
      );
    }
  }
  async charge(
    customer: Customer,
    amount: number,
    idempotencyKey: string,
  ): Promise<PaymentResult> {
    customer.debit(amount);
    const str = `CARD-${idempotencyKey}`;
    return { paymentId: str };
  }
  async refund(
    customer: Customer,
    amount: number,
    paymentId: string,
  ): Promise<void> {
    customer.credit(amount);
  }
}
