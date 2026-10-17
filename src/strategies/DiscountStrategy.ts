export interface DiscountStrategy {
  readonly code: string;
  calculate(subtotal: number): number;
}
