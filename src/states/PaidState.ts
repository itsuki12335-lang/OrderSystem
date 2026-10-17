import { OrderStatus } from "../enums/OrderStatus";
import { Order } from "../models/Order";
import { OrderState } from "./OrderState";
import { InvalidOrderTransitionError } from "../errors/InvalidOrderTransitionError";
export class PaidState implements OrderState {
  pay(order: Order, paymentId: string, paidAt: Date): void {
    throw new InvalidOrderTransitionError(order.id, order.status, "PAY");
  }
  ship(order: Order, trackingCode: string): void {
    order.status = OrderStatus.SHIPPED;
    order.trackingCode = trackingCode;
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
    throw new InvalidOrderTransitionError(order.id, order.status, "FAIL");
  }
}
