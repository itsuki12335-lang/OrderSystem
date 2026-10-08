import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi khách hàng yêu cầu hoàn tiền cho đơn hàng đã giao nhưng đã vượt quá số ngày cho phép theo chính sách đổi trả.
 * Mục đích: Thực thi quy tắc thời hạn đổi trả của sàn thương mại điện tử.
 */
export class RefundWindowExpiredError extends DomainErrors {
  public readonly orderId: string;
  public readonly windowDays: number;
  constructor(orderId: string, windowDays: number) {
    super(`Đơn hàng có mã ${orderId} đã quá thời gian yêu cầu hoàn tiền
        theo quy định tối đa ${windowDays} ngày`);
    this.orderId = orderId;
    this.windowDays = windowDays;
  }
}
