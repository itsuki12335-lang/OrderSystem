import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi khách hàng tạo đơn hàng nhưng danh sách mặt hàng (items) bị rỗng.
 * Mục đích: Ngăn chặn tạo đơn hàng vô nghĩa không có sản phẩm nào.
 */
export class EmptyOrderError extends DomainErrors {
  constructor() {
    super(`Danh sách mặt hàng này không được để trống`);
  }
}
