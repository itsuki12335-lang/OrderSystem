import { OrderStatus } from "../enums/OrderStatus";
import { InvalidOrderStatusError } from "../errors/InvalidOrderStatusError";
import { CancelledState } from "./CancelledState";
import { DeliveredState } from "./DeliveredState";
import { FailedState } from "./FailedState";
import { OrderState } from "./OrderState";
import { PaidState } from "./PaidState";
import { PendingState } from "./PendingState";
import { RefundedState } from "./RefundedState";
import { ShippedState } from "./ShippedState";

export class OrderStateFactory {
  static getState(status: OrderStatus): OrderState {
    switch (status) {
      case OrderStatus.PENDING:
        return new PendingState();
      case OrderStatus.SHIPPED:
        return new ShippedState();
      case OrderStatus.DELIVERED:
        return new DeliveredState();
      case OrderStatus.CANCELLED:
        return new CancelledState();
      case OrderStatus.FAILED:
        return new FailedState();
      case OrderStatus.PAID:
        return new PaidState();
      case OrderStatus.REFUNDED:
        return new RefundedState();
      default: {
        const exhaustiveCheck: never = status;
        throw new InvalidOrderStatusError(exhaustiveCheck);
      }
    }
  }
}
