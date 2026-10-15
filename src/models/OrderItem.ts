import { InvalidNum } from "../errors/InvalidNum";
import { InvalidQuantityError } from "../errors/InvalidQuantityError";

export class OrderItem {
  public readonly productId: string;
  public readonly quantity: number;
  public readonly unitPrice: number;
  constructor(productId: string, quantity: number, unitPrice: number) {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new InvalidQuantityError(productId, quantity);
    }
    if (unitPrice < 0 || !Number.isInteger(unitPrice)) {
      throw new InvalidNum(unitPrice);
    }
    ((this.productId = productId),
      (this.quantity = quantity),
      (this.unitPrice = unitPrice));
  }
  lineTotal(): number {
    return this.quantity * this.unitPrice;
  }
}
