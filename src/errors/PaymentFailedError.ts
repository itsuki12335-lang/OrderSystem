import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi cổng thanh toán hoặc phương thức thanh toán từ chối trừ tiền.
 * Mục đích: Thông báo thanh toán thất bại và chỉ định cờ retryable để cơ chế thử lại (withRetry) quyết định hành vi.
 */
export class PaymentFailedError extends DomainErrors {
  public readonly reason: string;
  public readonly retryable: boolean;
  constructor(reason: string, retryable: boolean) {
    super(`Thanh toán thất bại : ${reason}`);
    this.reason = reason;
    this.retryable = retryable;
  }
}
