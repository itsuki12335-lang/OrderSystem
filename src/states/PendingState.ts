import { OrderStatus } from "../enums/OrderStatus";
import { InvalidOrderTransitionError } from "../errors/InvalidOrderTransitionError";
import { Order } from "../models/Order";
import { OrderState } from "./OrderState";
export class PendingState implements OrderState {
  pay(order: Order, paymentId: string, paidAt: Date) {
    order.status = OrderStatus.PAID;
    order.paymentId = paymentId;
    order.paidAt = paidAt;
  }
  ship(order: Order, trackingCode: string): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "SHIP");
  }
  deliver(order: Order, deliveredAt: Date): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "DELIVER");
  }
  cancel(order: Order): void {
    order.status = OrderStatus.CANCELLED;
  }
  refund(order: Order): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "REFUND");
  }
  fail(order: Order, failureReason: string): void {
    order.status = OrderStatus.FAILED;
    order.failureReason = failureReason;
  }
}
