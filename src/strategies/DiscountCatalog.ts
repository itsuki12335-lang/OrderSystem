import { InvalidDiscountError } from "../errors/InvalidDiscountError";
import { DiscountStrategy } from "./DiscountStrategy";

export class DiscountCatalog {
  // Tạo 1 Map tên Catalog để lưu các mã được nạp vào từ hàm register
  private readonly catalog: Map<string, DiscountStrategy> = new Map();
  // Admin nạp mã giảm giá vào kho catalog bằng method này
  register(strategy: DiscountStrategy): void {
    this.catalog.set(strategy.code.toLowerCase(), strategy);
  }
  // Người dùng dùng method này để tìm mã giảm giá
  find(code: string): DiscountStrategy {
    const target = this.catalog.get(code.toLowerCase());
    if (!target) {
      throw new InvalidDiscountError(code, `Không tìm thấy ${code}`);
    }
    return target;
  }
}
