import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi đối tác vận chuyển từ chối hoặc gặp sự cố khi tạo vận đơn giao hàng.
 * Mục đích: Thông báo lỗi giao vận và đảm bảo đơn hàng không bị tự động chuyển sang trạng thái SHIPPED khi chưa có mã vận đơn hợp lệ.
 */
export class ShippingFailedError extends DomainErrors {
  public readonly reason: string;
  constructor(reason: string) {
    super(`Giao hàng thất bại : ${reason}`);
    this.reason = reason;
  }
}
