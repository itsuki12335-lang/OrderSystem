import { describe, it, expect } from "vitest";
import { Product } from "../src/models/Product";
import { InvalidNum } from "../src/errors/InvalidNum";
import { InvalidQuantityError } from "../src/errors/InvalidQuantityError";
import { OutOfStockError } from "../src/errors/OutOfStockError";

describe("Product Model Tests (Phase 2)", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  describe("Constructor & Validation ban đầu", () => {
    it("Testcase 1: Khởi tạo Product hợp lệ thành công", () => {
      const product = new Product("prod-1", "Bàn phím cơ", 500000, 10, 0, now);

      expect(product.id).toBe("prod-1");
      expect(product.name).toBe("Bàn phím cơ");
      expect(product.price).toBe(500000);
      expect(product.getStock()).toBe(10);
      expect(product.getReservedStock()).toBe(0);
      expect(product.getAvailable()).toBe(10);
      expect(product.createdAt).toBe(now);
      expect(product.updatedAt).toBe(now);
    });

    it("Testcase 2: Constructor ném lỗi khi price âm hoặc không phải số nguyên", () => {
      // Giá âm
      expect(
        () => new Product("prod-1", "Sản phẩm", -1000, 10, 0, now)
      ).toThrow(InvalidQuantityError);

      // Giá không nguyên (thập phân)
      expect(
        () => new Product("prod-1", "Sản phẩm", 100.5, 10, 0, now)
      ).toThrow(InvalidNum);
    });

    it("Testcase 3: Constructor ném lỗi khi stock âm hoặc không phải số nguyên", () => {
      // Stock âm
      expect(
        () => new Product("prod-1", "Sản phẩm", 1000, -5, 0, now)
      ).toThrow(InvalidQuantityError);

      // Stock không nguyên
      expect(
        () => new Product("prod-1", "Sản phẩm", 1000, 5.5, 0, now)
      ).toThrow(InvalidNum);
    });

    it("Testcase 4: Constructor ném lỗi khi reservedStock ban đầu khác 0", () => {
      expect(
        () => new Product("prod-1", "Sản phẩm", 1000, 10, 2, now)
      ).toThrow(InvalidQuantityError);
    });
  });

  describe("reserve(quantity)", () => {
    it("Testcase 5: reserve thành công tăng reservedStock và giảm available, stock không đổi", () => {
      const product = new Product("prod-1", "Chuột không dây", 200000, 10, 0, now);

      product.reserve(3);

      expect(product.getStock()).toBe(10);
      expect(product.getReservedStock()).toBe(3);
      expect(product.getAvailable()).toBe(7);
    });

    it("Testcase 6: reserve đúng bằng số lượng có sẵn (getAvailable) thành công", () => {
      const product = new Product("prod-1", "Màn hình", 3000000, 5, 0, now);

      product.reserve(5);

      expect(product.getReservedStock()).toBe(5);
      expect(product.getAvailable()).toBe(0);
    });

    it("Testcase 7: reserve vượt quá số lượng có sẵn ném OutOfStockError", () => {
      const product = new Product("prod-1", "Tai nghe", 150000, 5, 0, now);

      // Đặt hơn 1 đơn vị so với hàng có sẵn
      expect(() => product.reserve(6)).toThrow(OutOfStockError);

      // Trạng thái kho phải giữ nguyên, không bị thay đổi
      expect(product.getStock()).toBe(5);
      expect(product.getReservedStock()).toBe(0);
      expect(product.getAvailable()).toBe(5);
    });

    it("Testcase 8: reserve với số lượng không nguyên ném InvalidNum", () => {
      const product = new Product("prod-1", "Cáp sạc", 50000, 10, 0, now);

      expect(() => product.reserve(1.5)).toThrow(InvalidNum);
    });

    it("Testcase 9: reserve với quantity = 0 hoặc âm ném InvalidQuantityError", () => {
      const product = new Product("prod-1", "Cáp sạc", 50000, 10, 0, now);

      expect(() => product.reserve(0)).toThrow(InvalidQuantityError);
      expect(() => product.reserve(-1)).toThrow(InvalidQuantityError);
    });
  });

  describe("release(quantity)", () => {
    it("Testcase 10: release thành công giảm reservedStock và phục hồi available", () => {
      const product = new Product("prod-1", "Loa Bluetooth", 400000, 10, 0, now);
      product.reserve(4);

      product.release(2);

      expect(product.getStock()).toBe(10);
      expect(product.getReservedStock()).toBe(2);
      expect(product.getAvailable()).toBe(8);
    });

    it("Testcase 11: release quá mức (quantity > reservedStock) ném InvalidQuantityError", () => {
      const product = new Product("prod-1", "Loa Bluetooth", 400000, 10, 0, now);
      product.reserve(3);

      expect(() => product.release(4)).toThrow(InvalidQuantityError);

      // Trạng thái giữ chỗ không đổi
      expect(product.getReservedStock()).toBe(3);
    });

    it("Testcase 12: release với số lượng không nguyên ném InvalidNum", () => {
      const product = new Product("prod-1", "Loa", 400000, 10, 0, now);
      product.reserve(3);

      expect(() => product.release(1.5)).toThrow(InvalidNum);
    });

    it("Testcase 13: release với quantity = 0 hoặc âm ném InvalidQuantityError", () => {
      const product = new Product("prod-1", "Loa", 400000, 10, 0, now);
      product.reserve(3);

      expect(() => product.release(0)).toThrow(InvalidQuantityError);
      expect(() => product.release(-2)).toThrow(InvalidQuantityError);
    });
  });

  describe("commit(quantity)", () => {
    it("Testcase 14: commit thành công trừ cả stock và reservedStock", () => {
      const product = new Product("prod-1", "Laptop", 20000000, 5, 0, now);
      product.reserve(3);

      product.commit(2);

      expect(product.getStock()).toBe(3); // 5 - 2 = 3
      expect(product.getReservedStock()).toBe(1); // 3 - 2 = 1
      expect(product.getAvailable()).toBe(2); // 3 - 1 = 2
    });

    it("Testcase 15: commit vượt quá số lượng đã reserve ném InvalidQuantityError", () => {
      const product = new Product("prod-1", "Laptop", 20000000, 5, 0, now);
      product.reserve(2);

      expect(() => product.commit(3)).toThrow(InvalidQuantityError);

      // Kho không bị thay đổi
      expect(product.getStock()).toBe(5);
      expect(product.getReservedStock()).toBe(2);
    });

    it("Testcase 16: commit với quantity không nguyên ném InvalidNum", () => {
      const product = new Product("prod-1", "Laptop", 20000000, 5, 0, now);
      product.reserve(2);

      expect(() => product.commit(1.5)).toThrow(InvalidNum);
    });

    it("Testcase 17: commit với quantity = 0 hoặc âm ném InvalidQuantityError", () => {
      const product = new Product("prod-1", "Laptop", 20000000, 5, 0, now);
      product.reserve(2);

      expect(() => product.commit(0)).toThrow(InvalidQuantityError);
      expect(() => product.commit(-1)).toThrow(InvalidQuantityError);
    });
  });

  describe("restock(quantity)", () => {
    it("Testcase 18: restock thành công tăng stock và available", () => {
      const product = new Product("prod-1", "Áo thun", 150000, 10, 0, now);
      product.reserve(2);

      product.restock(5);

      expect(product.getStock()).toBe(15);
      expect(product.getReservedStock()).toBe(2);
      expect(product.getAvailable()).toBe(13);
    });

    it("Testcase 19: restock với quantity không nguyên ném InvalidNum", () => {
      const product = new Product("prod-1", "Áo thun", 150000, 10, 0, now);

      expect(() => product.restock(2.5)).toThrow(InvalidNum);
    });

    it("Testcase 20: restock với quantity = 0 hoặc âm ném InvalidQuantityError", () => {
      const product = new Product("prod-1", "Áo thun", 150000, 10, 0, now);

      expect(() => product.restock(0)).toThrow(InvalidQuantityError);
      expect(() => product.restock(-5)).toThrow(InvalidQuantityError);
    });
  });

  describe("Luồng nghiệp vụ trọn vòng đời kho", () => {
    it("Testcase 21: Toàn bộ chu kỳ reserve -> release -> commit -> restock", () => {
      const product = new Product("prod-1", "Đồng hồ thông minh", 1000000, 10, 0, now);

      // Khách 1 đặt 4 chiếc
      product.reserve(4);
      expect(product.getAvailable()).toBe(6);

      // Khách 1 đổi ý chỉ mua 3 chiếc, nhả lại 1 chiếc
      product.release(1);
      expect(product.getReservedStock()).toBe(3);
      expect(product.getAvailable()).toBe(7);

      // Khách 1 thanh toán thành công 3 chiếc
      product.commit(3);
      expect(product.getStock()).toBe(7);
      expect(product.getReservedStock()).toBe(0);
      expect(product.getAvailable()).toBe(7);

      // Kho nhập thêm 5 chiếc mới
      product.restock(5);
      expect(product.getStock()).toBe(12);
      expect(product.getAvailable()).toBe(12);
    });
  });
});
