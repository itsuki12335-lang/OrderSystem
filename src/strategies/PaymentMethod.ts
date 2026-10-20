import { Customer } from "../models/Customer";
import { PaymentResult } from "./PaymentResult";

export interface PaymentMethod {
  readonly name: string;
  validate(customer: Customer, amount: number): void;
  charge(
    customer: Customer,
    amount: number,
    idempotencyKey: string,
  ): Promise<PaymentResult>;
  refund(customer: Customer, amount: number, paymentId: string): Promise<void>;
}
