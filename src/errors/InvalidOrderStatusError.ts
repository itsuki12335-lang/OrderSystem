import { OrderStatus } from "../enums/OrderStatus";
import { DomainErrors } from "./DomainErrors";
export class InvalidOrderStatusError extends DomainErrors {
  public readonly status: OrderStatus;
  constructor(status: OrderStatus) {
    super(`Phát hiện trạng thái không hợp lệ : ${status}`);
    this.status = status;
  }
}
