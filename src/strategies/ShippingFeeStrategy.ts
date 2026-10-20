export interface ShippingFeeStrategy {
  calculate(subtotal: number): number;
}
