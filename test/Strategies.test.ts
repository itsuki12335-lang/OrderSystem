import { describe, it, expect, beforeEach } from "vitest";
import { PercentageDiscount } from "../src/strategies/PercentageDiscount";
import { FixedAmountDiscount } from "../src/strategies/FixedAmountDiscount";
import { DiscountCatalog } from "../src/strategies/DiscountCatalog";
import { FlatShippingFee } from "../src/strategies/FlatShippingFee";
import { FreeShippingAboveThreshold } from "../src/strategies/FreeShippingAboveThreshold";
import { WalletPaymentMethod } from "../src/strategies/WalletPaymentMethod";
import { CardPaymentMethod } from "../src/strategies/CardPaymentMethod";
import { Customer } from "../src/models/Customer";
import { InvalidDiscountError } from "../src/errors/InvalidDiscountError";
import { InvalidNum } from "../src/errors/InvalidNum";
import { InsufficientBalanceError } from "../src/errors/InsufficientBalanceError";

describe("Phase 4: Strategies Tests - Discount Strategies & Catalog", () => {
  describe("1. PercentageDiscount Strategy Tests", () => {
    describe("Constructor Validation", () => {
      it("Khởi tạo thành công với tham số hợp lệ (không có maxDiscount)", () => {
        const discount = new PercentageDiscount("SALE10", 10);
        expect(discount.code).toBe("SALE10");
        expect(discount.percent).toBe(10);
        expect(discount.maxDiscount).toBeUndefined();
      });

      it("Khởi tạo thành công với tham số hợp lệ (có maxDiscount)", () => {
        const discount = new PercentageDiscount("SALE20", 20, 50000);
        expect(discount.code).toBe("SALE20");
        expect(discount.percent).toBe(20);
        expect(discount.maxDiscount).toBe(50000);
      });

      it("Ném lỗi khi percent <= 0", () => {
        expect(() => new PercentageDiscount("BAD0", 0)).toThrow(InvalidDiscountError);
        expect(() => new PercentageDiscount("BAD_NEG", -10)).toThrow(InvalidDiscountError);
      });

      it("Ném lỗi khi percent > 100", () => {
        expect(() => new PercentageDiscount("BAD101", 101)).toThrow(InvalidDiscountError);
        expect(() => new PercentageDiscount("BAD200", 200)).toThrow(InvalidDiscountError);
      });

      it("Ném lỗi khi percent không phải số nguyên", () => {
        expect(() => new PercentageDiscount("FLOAT_PCT", 10.5)).toThrow(InvalidDiscountError);
      });

      it("Ném lỗi khi maxDiscount được truyền vào nhưng <= 0", () => {
        expect(() => new PercentageDiscount("BAD_MAX_0", 10, 0)).toThrow(InvalidDiscountError);
        expect(() => new PercentageDiscount("BAD_MAX_NEG", 10, -5000)).toThrow(InvalidDiscountError);
      });

      it("Ném lỗi khi maxDiscount được truyền vào nhưng không phải số nguyên", () => {
        expect(() => new PercentageDiscount("FLOAT_MAX", 10, 50000.5)).toThrow(InvalidDiscountError);
      });
    });

    describe("Calculate Logic", () => {
      it("Tính đúng số tiền giảm không có maxDiscount", () => {
        const discount = new PercentageDiscount("SALE10", 10);
        // 200.000 * 10% = 20.000
        expect(discount.calculate(200000)).toBe(20000);
      });

      it("Làm tròn xuống số nguyên khi kết quả phần trăm có số thập phân", () => {
        const discount = new PercentageDiscount("SALE15", 15);
        // 199.999 * 15% = 29999.85 -> làm tròn xuống 29999
        expect(discount.calculate(199999)).toBe(29999);
      });

      it("Trả về 0 khi subtotal = 0", () => {
        const discount = new PercentageDiscount("SALE10", 10);
        expect(discount.calculate(0)).toBe(0);
      });

      it("Giảm 100% khi percent = 100", () => {
        const discount = new PercentageDiscount("FREE100", 100);
        expect(discount.calculate(500000)).toBe(500000);
      });

      it("Chặn trần đúng mức maxDiscount khi số tiền giảm tính ra vượt trần", () => {
        // Giảm 20%, trần 50.000đ. Đơn 1.000.000đ đáng lẽ giảm 200.000đ -> chỉ giảm 50.000đ
        const discount = new PercentageDiscount("CAP20", 20, 50000);
        expect(discount.calculate(1000000)).toBe(50000);
      });

      it("Không bị chặn trần khi số tiền giảm tính ra nhỏ hơn maxDiscount", () => {
        // Giảm 20%, trần 50.000đ. Đơn 100.000đ giảm 20.000đ (< 50.000đ) -> giảm đúng 20.000đ
        const discount = new PercentageDiscount("CAP20", 20, 50000);
        expect(discount.calculate(100000)).toBe(20000);
      });
    });
  });

  describe("2. FixedAmountDiscount Strategy Tests", () => {
    describe("Constructor Validation", () => {
      it("Khởi tạo thành công với số tiền nguyên dương", () => {
        const discount = new FixedAmountDiscount("VOUCHER50K", 50000);
        expect(discount.code).toBe("VOUCHER50K");
        expect(discount.amount).toBe(50000);
      });

      it("Ném lỗi khi amount <= 0", () => {
        expect(() => new FixedAmountDiscount("ZERO", 0)).toThrow(InvalidDiscountError);
        expect(() => new FixedAmountDiscount("NEG", -20000)).toThrow(InvalidDiscountError);
      });

      it("Ném lỗi khi amount không phải số nguyên", () => {
        expect(() => new FixedAmountDiscount("FLOAT", 50000.5)).toThrow(InvalidDiscountError);
      });
    });

    describe("Calculate Logic", () => {
      it("Giảm đúng số tiền amount khi subtotal > amount", () => {
        const discount = new FixedAmountDiscount("VOUCHER30K", 30000);
        // Đơn 100.000đ, giảm 30.000đ
        expect(discount.calculate(100000)).toBe(30000);
      });

      it("Giảm bằng đúng subtotal khi subtotal = amount", () => {
        const discount = new FixedAmountDiscount("VOUCHER50K", 50000);
        // Đơn 50.000đ, giảm 50.000đ -> hóa đơn còn 0đ
        expect(discount.calculate(50000)).toBe(50000);
      });

      it("Chặn trần ở subtotal khi subtotal < amount (không giảm vượt quá tiền hàng)", () => {
        const discount = new FixedAmountDiscount("VOUCHER50K", 50000);
        // Đơn chỉ có 30.000đ, voucher 50.000đ -> chỉ giảm tối đa 30.000đ
        expect(discount.calculate(30000)).toBe(30000);
      });

      it("Trả về 0 khi subtotal = 0", () => {
        const discount = new FixedAmountDiscount("VOUCHER50K", 50000);
        expect(discount.calculate(0)).toBe(0);
      });
    });
  });

  describe("3. DiscountCatalog Tests", () => {
    let catalog: DiscountCatalog;

    beforeEach(() => {
      catalog = new DiscountCatalog();
    });

    it("Đăng ký và tìm thấy mã giảm giá chính xác", () => {
      const pctDiscount = new PercentageDiscount("VIP10", 10);
      catalog.register(pctDiscount);

      const found = catalog.find("VIP10");
      expect(found).toBe(pctDiscount);
      expect(found.calculate(200000)).toBe(20000);
    });

    it("Tìm kiếm mã không phân biệt chữ hoa và chữ thường", () => {
      const fixedDiscount = new FixedAmountDiscount("SUMMER50", 50000);
      catalog.register(fixedDiscount);

      // Đăng ký chữ hoa, tìm bằng chữ thường, chữ hoa, hoặc lẫn lộn
      expect(catalog.find("summer50")).toBe(fixedDiscount);
      expect(catalog.find("SUMMER50")).toBe(fixedDiscount);
      expect(catalog.find("Summer50")).toBe(fixedDiscount);
      expect(catalog.find("sUmMeR50")).toBe(fixedDiscount);
    });

    it("Đăng ký bằng chữ thường nhưng tìm bằng chữ hoa vẫn thành công", () => {
      const discount = new PercentageDiscount("winter20", 20);
      catalog.register(discount);

      expect(catalog.find("WINTER20")).toBe(discount);
    });

    it("Ném lỗi InvalidDiscountError khi mã không tồn tại trong catalog", () => {
      expect(() => catalog.find("NON_EXISTING_CODE")).toThrow(InvalidDiscountError);

      try {
        catalog.find("GHOST_CODE");
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidDiscountError);
        const err = error as InvalidDiscountError;
        expect(err.code).toBe("GHOST_CODE");
      }
    });

    it("Cho phép đăng ký nhiều loại chiến lược khác nhau vào cùng một Catalog", () => {
      const pct = new PercentageDiscount("PCT10", 10);
      const fixed = new FixedAmountDiscount("FIX30", 30000);

      catalog.register(pct);
      catalog.register(fixed);

      expect(catalog.find("pct10")).toBe(pct);
      expect(catalog.find("fix30")).toBe(fixed);
    });
  });

  describe("4. FlatShippingFee Strategy Tests", () => {
    describe("Constructor Validation", () => {
      it("Khởi tạo thành công với phí hợp lệ", () => {
        const shipping = new FlatShippingFee(30000);
        expect(shipping.fee).toBe(30000);
      });

      it("Khởi tạo thành công với fee = 0 (freeship đồng giá toàn sàn)", () => {
        const freeShipping = new FlatShippingFee(0);
        expect(freeShipping.fee).toBe(0);
        expect(freeShipping.calculate(500000)).toBe(0);
      });

      it("Ném lỗi InvalidNum khi fee < 0", () => {
        expect(() => new FlatShippingFee(-5000)).toThrow(InvalidNum);
      });

      it("Ném lỗi InvalidNum khi fee không phải số nguyên", () => {
        expect(() => new FlatShippingFee(30000.5)).toThrow(InvalidNum);
      });
    });

    describe("Calculate Logic", () => {
      it("Luôn trả về đúng mức phí fee bất kể subtotal là bao nhiêu", () => {
        const shipping = new FlatShippingFee(30000);
        expect(shipping.calculate(0)).toBe(30000);
        expect(shipping.calculate(100000)).toBe(30000);
        expect(shipping.calculate(5000000)).toBe(30000);
      });
    });
  });

  describe("5. FreeShippingAboveThreshold Strategy Tests", () => {
    describe("Constructor Validation", () => {
      it("Khởi tạo thành công với threshold và baseFee hợp lệ", () => {
        const shipping = new FreeShippingAboveThreshold(300000, 30000);
        expect(shipping.threshold).toBe(300000);
        expect(shipping.baseFee).toBe(30000);
      });

      it("Ném lỗi InvalidNum khi threshold < 1 hoặc không nguyên", () => {
        expect(() => new FreeShippingAboveThreshold(0, 30000)).toThrow(InvalidNum);
        expect(() => new FreeShippingAboveThreshold(-10000, 30000)).toThrow(InvalidNum);
        expect(() => new FreeShippingAboveThreshold(300000.5, 30000)).toThrow(InvalidNum);
      });

      it("Ném lỗi InvalidNum khi baseFee < 1 hoặc không nguyên", () => {
        expect(() => new FreeShippingAboveThreshold(300000, 0)).toThrow(InvalidNum);
        expect(() => new FreeShippingAboveThreshold(300000, -5000)).toThrow(InvalidNum);
        expect(() => new FreeShippingAboveThreshold(300000, 30000.5)).toThrow(InvalidNum);
      });
    });

    describe("Calculate Logic (Kiểm tra các biên Freeship)", () => {
      const threshold = 300000;
      const baseFee = 30000;
      const shipping = new FreeShippingAboveThreshold(threshold, baseFee);

      it("Trả về baseFee khi subtotal = 0", () => {
        expect(shipping.calculate(0)).toBe(baseFee);
      });

      it("Trả về baseFee khi subtotal thấp hơn ngưỡng đúng 1đ (subtotal = threshold - 1)", () => {
        expect(shipping.calculate(threshold - 1)).toBe(baseFee);
      });

      it("Trả về 0đ khi subtotal bằng đúng ngưỡng (subtotal = threshold)", () => {
        expect(shipping.calculate(threshold)).toBe(0);
      });

      it("Trả về 0đ khi subtotal vượt ngưỡng (subtotal > threshold)", () => {
        expect(shipping.calculate(threshold + 50000)).toBe(0);
        expect(shipping.calculate(1000000)).toBe(0);
      });
    });
  });

  describe("6. WalletPaymentMethod Strategy Tests", () => {
    let walletMethod: WalletPaymentMethod;
    const now = new Date("2026-01-01T00:00:00.000Z");

    beforeEach(() => {
      walletMethod = new WalletPaymentMethod();
    });

    it("Có thuộc tính name bằng WALLET", () => {
      expect(walletMethod.name).toBe("WALLET");
    });

    it("validate không ném lỗi khi khách đủ tiền trong ví", () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 500000);
      expect(() => walletMethod.validate(customer, 200000)).not.toThrow();
      expect(() => walletMethod.validate(customer, 500000)).not.toThrow();
    });

    it("validate ném InsufficientBalanceError khi khách không đủ tiền", () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 100000);
      expect(() => walletMethod.validate(customer, 200000)).toThrow(InsufficientBalanceError);
    });

    it("charge thực hiện trừ ví và trả về paymentId dạng WAL-<idempotencyKey>", async () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 500000);
      const result = await walletMethod.charge(customer, 200000, "idem-123");

      expect(customer.getBalance()).toBe(300000);
      expect(result).toEqual({ paymentId: "WAL-idem-123" });
    });

    it("refund thực hiện cộng tiền lại vào ví khách hàng", async () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 300000);
      await walletMethod.refund(customer, 200000, "WAL-idem-123");

      expect(customer.getBalance()).toBe(500000);
    });
  });

  describe("7. CardPaymentMethod Strategy Tests", () => {
    let cardMethod: CardPaymentMethod;
    const now = new Date("2026-01-01T00:00:00.000Z");

    beforeEach(() => {
      cardMethod = new CardPaymentMethod();
    });

    it("Có thuộc tính name bằng CARD", () => {
      expect(cardMethod.name).toBe("CARD");
    });

    it("validate không ném lỗi khi khách đủ điều kiện", () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 500000);
      expect(() => cardMethod.validate(customer, 200000)).not.toThrow();
    });

    it("validate ném InsufficientBalanceError khi không đủ điều kiện", () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 50000);
      expect(() => cardMethod.validate(customer, 100000)).toThrow(InsufficientBalanceError);
    });

    it("charge trừ ví và trả về paymentId dạng CARD-<idempotencyKey>", async () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 500000);
      const result = await cardMethod.charge(customer, 200000, "idem-456");

      expect(customer.getBalance()).toBe(300000);
      expect(result).toEqual({ paymentId: "CARD-idem-456" });
    });

    it("refund cộng tiền lại vào ví", async () => {
      const customer = new Customer("c1", "a@test.com", "Cust 1", now, now, 300000);
      await cardMethod.refund(customer, 200000, "CARD-idem-456");

      expect(customer.getBalance()).toBe(500000);
    });
  });
});

