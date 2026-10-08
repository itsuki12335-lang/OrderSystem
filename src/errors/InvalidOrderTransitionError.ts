import { DomainErrors } from "./DomainErrors";
import { OrderStatus } from "../enums/OrderStatus";

/**
 * Lỗi phát sinh khi thực hiện một hành động không được phép đối với trạng thái hiện tại của đơn hàng.
 * Mục đích: Bảo vệ máy trạng thái (State Machine) của đơn hàng, ngăn ngừa nhảy bước trạng thái sai quy tắc.
 */
export class InvalidOrderTransitionError extends DomainErrors {
  public readonly orderId: string;
  public readonly from: OrderStatus;
  public readonly action: string;
  constructor(orderId: string, from: OrderStatus, action: string) {
    super(`Không thể thực hiện hành động ${action} cho đơn hàng ${orderId}
        khi đang ở trạng thái ${from}`);
    this.action = action;
    this.from = from;
    this.orderId = orderId;
  }
}
