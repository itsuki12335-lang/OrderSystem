import { Order } from "../models/Order";
import { OrderState } from "./OrderState";

import { InvalidOrderTransitionError } from "../errors/InvalidOrderTransitionError";
import { OrderStatus } from "../enums/OrderStatus";
export class DeliveredState implements OrderState {
  pay(order: Order, paymentId: string, paidAt: Date): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "PAY");
  }
  ship(order: Order, trackingCode: string): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "SHIP");
  }
  deliver(order: Order, deliveredAt: Date): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "DELIVERED");
  }
  cancel(order: Order): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "CANCELLED");
  }
  refund(order: Order): void {
    order.status = OrderStatus.REFUNDED;
  }
  fail(order: Order, failureReason: string): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "FAIL");
  }
}
