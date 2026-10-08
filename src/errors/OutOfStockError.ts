import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi số lượng tồn kho khả dụng (stock - reservedStock) không đủ để đáp ứng số lượng yêu cầu.
 * Mục đích: Ngăn chặn việc bán vượt quá số lượng hàng thực tế có trong kho (overselling).
 */
export class OutOfStockError extends DomainErrors {
  public readonly productId: string;
  public readonly requested: number;
  public readonly available: number;
  constructor(productId: string, requested: number, available: number) {
    super(
      `Sản phẩm có mã ${productId} hiện không còn đủ ${requested}.Khả dụng : ${available}`,
    );
    this.productId = productId;
    this.requested = requested;
    this.available = available;
  }
}
