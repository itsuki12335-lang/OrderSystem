import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi mã giảm giá không tồn tại, hết hạn, hoặc tham số cấu hình giảm giá không hợp lệ.
 * Mục đích: Thẩm định tính đúng đắn của chiến lược và mã giảm giá trước khi tính toán tổng tiền đơn hàng.
 */
export class InvalidDiscountError extends DomainErrors {
  public readonly code: string;
  public readonly reason: string;
  constructor(code: string, reason: string) {
    super(`Mã giảm giá ${code} không hợp lệ : ${reason}`);
    this.code = code;
    this.reason = reason;
  }
}
