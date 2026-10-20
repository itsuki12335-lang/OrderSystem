import { InvalidNum } from "../errors/InvalidNum";
import { ShippingFeeStrategy } from "./ShippingFeeStrategy";
export class FlatShippingFee implements ShippingFeeStrategy {
  readonly fee: number;
  // Ship cứng cố định cho tất cả đơn hàng
  constructor(fee: number) {
    if (fee < 0 || !Number.isInteger(fee)) throw new InvalidNum(fee);
    this.fee = fee;
  }
  calculate(subtotal: number): number {
    return this.fee;
  }
}
