import { InvalidDiscountError } from "../errors/InvalidDiscountError";
import { InvalidNum } from "../errors/InvalidNum";
import { DiscountStrategy } from "./DiscountStrategy";
export class PercentageDiscount implements DiscountStrategy {
  readonly code: string;
  readonly percent: number;
  readonly maxDiscount?: number;
  constructor(code: string, percent: number, maxDiscount?: number) {
    if (percent < 1 || percent > 100) {
      throw new InvalidDiscountError(code, "Không phù hợp");
    }
    if (maxDiscount !== undefined) {
      if (maxDiscount < 1) {
        throw new InvalidDiscountError(code, `${maxDiscount} phải lớn hơn 0`);
      }
      if (Number.isInteger(maxDiscount) === false) {
        throw new InvalidDiscountError(code, "Mã giảm giá không hợp lệ");
      }
    }
    if (!Number.isInteger(percent)) {
      throw new InvalidDiscountError(
        code,
        `Phần trăm giảm giá phải là số nguyên`,
      );
    }
    ((this.code = code),
      (this.percent = percent),
      (this.maxDiscount = maxDiscount));
  }
  calculate(subtotal: number): number {
    if (subtotal < 0) {
      throw new InvalidNum(subtotal);
    }
    const total = Math.floor((subtotal * this.percent) / 100);
    if (this.maxDiscount !== undefined) {
      return Math.min(total, this.maxDiscount);
    }
    return total;
  }
}
