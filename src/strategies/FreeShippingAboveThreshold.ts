import { InvalidNum } from "../errors/InvalidNum";
import { ShippingFeeStrategy } from "./ShippingFeeStrategy";
export class FreeShippingAboveThreshold implements ShippingFeeStrategy {
  readonly threshold: number;
  readonly baseFee: number;
  constructor(threshold: number, baseFee: number) {
    if (!Number.isInteger(threshold) || threshold < 1)
      throw new InvalidNum(threshold);
    if (!Number.isInteger(baseFee) || baseFee < 1)
      throw new InvalidNum(baseFee);
    this.threshold = threshold;
    this.baseFee = baseFee;
  }
  calculate(subtotal: number): number {
    if (subtotal < this.threshold) {
      return this.baseFee;
    }
    return 0;
  }
}
