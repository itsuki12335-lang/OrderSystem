import { InvalidDiscountError } from "../errors/InvalidDiscountError";
import { DiscountStrategy } from "./DiscountStrategy";

export class FixedAmountDiscount implements DiscountStrategy {
  readonly code: string;
  readonly amount: number;
  constructor(code: string, amount: number) {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new InvalidDiscountError(
        code,
        "Yêu cầu phải là số nguyên và không âm",
      );
    }
    this.code = code;
    this.amount = amount;
  }
  calculate(subtotal: number): number {
    return Math.min(subtotal, this.amount);
  }
}
