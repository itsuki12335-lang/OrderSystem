import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi tra cứu đơn hàng theo ID nhưng không tìm thấy trong hệ thống.
 * Mục đích: Thẩm định sự tồn tại của đơn hàng trước khi thực hiện các thao tác vòng đời (ship, cancel, refund...).
 */
export class OrderNotFoundError extends DomainErrors {
  public readonly orderId: string;
  constructor(orderId: string) {
    super(`Không tìm thấy mã đơn hàng :${orderId}`);
    this.orderId = orderId;
  }
}
