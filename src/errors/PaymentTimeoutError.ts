import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi cổng thanh toán không phản hồi trong khoảng thời gian quy định (timeout).
 * Mục đích: Nhận diện trường hợp mất kết nối để kích hoạt quy trình truy vấn trạng thái giao dịch (getChargeStatus).
 */
export class PaymentTimeoutError extends DomainErrors {
  public readonly timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`Giao dịch thanh toán quá thời gian chờ sau : ${timeoutMs}`);
    this.timeoutMs = timeoutMs;
  }
}
