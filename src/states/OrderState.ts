import { Order } from "../models/Order";

export interface OrderState {
  pay(order: Order, paymentId: string, paidAt: Date): void;
  ship(order: Order, trackingCode: string): void;
  deliver(order: Order, deliveredAt: Date): void;
  cancel(order: Order): void;
  refund(order: Order): void;
  fail(order: Order, failureReason: string): void;
}
