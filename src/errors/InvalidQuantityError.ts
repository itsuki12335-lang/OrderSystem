import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi số lượng sản phẩm không hợp lệ (không phải số nguyên dương, hoặc số lượng giải phóng/commit vượt quá số lượng đã giữ).
 * Mục đích: Bảo vệ tính toàn vẹn của các phép toán tăng/giảm số lượng sản phẩm.
 */
export class InvalidQuantityError extends DomainErrors {
  public readonly productId: string;
  public readonly quantity: number;
  constructor(productId: string, quantity: number) {
    super(`Số lượng sản phẩm ${productId} không hợp lệ:${quantity}`);
    this.productId = productId;
    this.quantity = quantity;
  }
}
