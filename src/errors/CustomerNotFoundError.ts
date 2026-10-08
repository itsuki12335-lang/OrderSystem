import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi tra cứu khách hàng theo ID nhưng không tìm thấy trong hệ thống.
 * Mục đích: Thẩm định sự tồn tại của khách hàng trước khi kiểm tra ví hoặc đặt hàng.
 */
export class CustomerNotFoundError extends DomainErrors {
  public readonly customerId: string;
  constructor(customerId: string) {
    super(`Không tìm thấy khách hàng có ID:${customerId}`);
    this.customerId = customerId;
  }
}
