import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi tra cứu sản phẩm theo ID nhưng không tìm thấy trong hệ thống.
 * Mục đích: Thẩm định sự tồn tại của sản phẩm trước khi xử lý tồn kho hoặc tạo đơn hàng.
 */
export class ProductNotFoundError extends DomainErrors {
  public readonly productId: string;
  constructor(productId: string) {
    super(`Không tìm thấy sản phẩm có mã ${productId}`);
    this.productId = productId;
  }
}
