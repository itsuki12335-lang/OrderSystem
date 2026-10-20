import { OrderStatus } from "../enums/OrderStatus";
import { EmptyOrderError } from "../errors/EmptyOrderError";
import { InvalidNum } from "../errors/InvalidNum";
import { Entity } from "./Entity";
import { OrderItem } from "./OrderItem";

export interface OrderOptions {
  readonly id: string;
  readonly requestId: string;
  readonly customerId: string;
  readonly items: OrderItem[];
  readonly subtotal: number;
  readonly discountCode: string | null;
  readonly discountAmount: number;
  readonly shippingFee: number;
  readonly total: number;
  readonly paymentMethodName: string;
  status?: OrderStatus;
  paymentId?: string | null;
  trackingCode?: string | null;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  failureReason?: string | null;
  readonly createdAt: Date;
  updatedAt: Date;
}
export class Order implements Entity {
  readonly id: string;
  readonly requestId: string;
  readonly customerId: string;
  readonly items: readonly OrderItem[];
  readonly subtotal: number;
  readonly discountCode: string | null;
  readonly discountAmount: number;
  readonly shippingFee: number;
  readonly total: number;
  readonly paymentMethodName: string;
  status: OrderStatus;
  paymentId: string | null;
  trackingCode: string | null;
  paidAt: Date | null;
  deliveredAt: Date | null;
  failureReason: string | null;
  readonly createdAt: Date;
  updatedAt: Date;
  constructor(options: OrderOptions) {
    if (options.items.length === 0) {
      throw new EmptyOrderError();
    }
    if (options.subtotal < 0) {
      throw new InvalidNum(options.subtotal);
    }
    if (options.discountAmount < 0) {
      throw new InvalidNum(options.discountAmount);
    }
    if (options.shippingFee < 0) {
      throw new InvalidNum(options.shippingFee);
    }
    this.id = options.id;
    this.requestId = options.requestId;
    this.customerId = options.customerId;
    this.items = [...options.items];
    this.subtotal = options.subtotal;
    this.discountCode = options.discountCode;
    this.discountAmount = options.discountAmount;
    this.shippingFee = options.shippingFee;
    this.total = Order.computeTotal(
      options.subtotal,
      options.discountAmount,
      options.shippingFee,
    );
    this.paymentMethodName = options.paymentMethodName;
    this.status = options.status ?? OrderStatus.PENDING;
    this.paymentId = options.paymentId ?? null;
    this.trackingCode = options.trackingCode ?? null;
    this.paidAt = options.paidAt ?? null;
    this.deliveredAt = options.deliveredAt ?? null;
    this.failureReason = options.failureReason ?? null;
    this.createdAt = options.createdAt;
    this.updatedAt = options.updatedAt;
  }
  static computeTotal(
    subtotal: number,
    discountAmount: number,
    shippingFee: number,
  ): number {
    const total = subtotal - discountAmount + shippingFee;
    return Math.max(0, total);
  }
}
