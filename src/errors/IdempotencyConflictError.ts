import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi client gửi một requestId đã tồn tại nhưng nội dung đơn hàng (payload) lại khác với yêu cầu ban đầu.
 * Mục đích: Đảm bảo tính lũy đẳng (idempotency) và ngăn ngừa việc tái sử dụng sai mã định danh yêu cầu.
 */
export class IdempotencyConflictError extends DomainErrors {
  public readonly requestId: string;
  constructor(requestId: string) {
    super(`Yêu cầu với requestId ${requestId} đã được sử dụng cho
            một đơn hàng khác`);
    this.requestId = requestId;
  }
}
