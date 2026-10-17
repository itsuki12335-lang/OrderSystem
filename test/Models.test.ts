import { describe, it, expect } from "vitest";
import { Product } from "../src/models/Product";
import { Customer } from "../src/models/Customer";
import { OrderItem } from "../src/models/OrderItem";
import { Order } from "../src/models/Order";
import { OrderStatus } from "../src/enums/OrderStatus";
import { InvalidNum } from "../src/errors/InvalidNum";
import { InvalidQuantityError } from "../src/errors/InvalidQuantityError";
import { OutOfStockError } from "../src/errors/OutOfStockError";
import { InvalidBalance } from "../src/errors/InvalidBalance";
import { InsufficientBalanceError } from "../src/errors/InsufficientBalanceError";
import { EmptyOrderError } from "../src/errors/EmptyOrderError";

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

describe("Customer Model Tests (Phase 2)", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  describe("Constructor & Validation", () => {
    it("Testcase 22: Khởi tạo Customer hợp lệ thành công", () => {
      const customer = new Customer("cust-1", "user@test.com", "Nguyen Van A", now, now, 500000);

      expect(customer.id).toBe("cust-1");
      expect(customer.email).toBe("user@test.com");
      expect(customer.name).toBe("Nguyen Van A");
      expect(customer.createdAt).toBe(now);
      expect(customer.updatedAt).toBe(now);
      expect(customer.getBalance()).toBe(500000);
    });

    it("Testcase 23: Constructor ném InvalidBalance khi walletBalance âm", () => {
      expect(() => new Customer("cust-1", "user@test.com", "User", now, now, -1000)).toThrow(InvalidBalance);
    });

    it("Testcase 24: Constructor ném InvalidNum khi walletBalance không nguyên", () => {
      expect(() => new Customer("cust-1", "user@test.com", "User", now, now, 100.5)).toThrow(InvalidNum);
    });

    it("Testcase 25: Khởi tạo Customer với số dư ví ban đầu bằng 0 thành công", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 0);
      expect(customer.getBalance()).toBe(0);
    });
  });

  describe("getBalance() & canAfford(amount)", () => {
    it("Testcase 26: getBalance trả về đúng số dư ví", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 200000);
      expect(customer.getBalance()).toBe(200000);
    });

    it("Testcase 27: canAfford trả về true khi amount nhỏ hơn số dư ví", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 500000);
      expect(customer.canAfford(300000)).toBe(true);
    });

    it("Testcase 28: canAfford trả về true khi amount đúng bằng số dư ví", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 300000);
      expect(customer.canAfford(300000)).toBe(true);
    });

    it("Testcase 29: canAfford trả về false khi amount lớn hơn số dư ví 1 đồng", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 300000);
      expect(customer.canAfford(300001)).toBe(false);
    });

    it("Testcase 30: canAfford trả về false khi amount bằng 0, âm hoặc không nguyên", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 300000);
      expect(customer.canAfford(0)).toBe(false);
      expect(customer.canAfford(-50000)).toBe(false);
      expect(customer.canAfford(100.5)).toBe(false);
    });
  });

  describe("debit(amount)", () => {
    it("Testcase 31: debit thành công trừ số dư ví và trả về số dư mới", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 500000);
      const newBalance = customer.debit(200000);

      expect(newBalance).toBe(300000);
      expect(customer.getBalance()).toBe(300000);
    });

    it("Testcase 32: debit đúng bằng số dư ví đưa số dư về 0", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 200000);
      const newBalance = customer.debit(200000);

      expect(newBalance).toBe(0);
      expect(customer.getBalance()).toBe(0);
    });

    it("Testcase 33: debit lớn hơn số dư ví ném InsufficientBalanceError và số dư không đổi", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 200000);

      expect(() => customer.debit(200001)).toThrow(InsufficientBalanceError);
      expect(customer.getBalance()).toBe(200000);
    });

    it("Testcase 34: debit với số tiền âm hoặc bằng 0 ném InvalidNum và số dư không đổi", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 200000);

      expect(() => customer.debit(0)).toThrow(InvalidNum);
      expect(() => customer.debit(-50000)).toThrow(InvalidNum);
      expect(customer.getBalance()).toBe(200000);
    });

    it("Testcase 35: debit với số tiền không nguyên ném InvalidNum và số dư không đổi", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 200000);

      expect(() => customer.debit(50.5)).toThrow(InvalidNum);
      expect(customer.getBalance()).toBe(200000);
    });
  });

  describe("credit(amount)", () => {
    it("Testcase 36: credit thành công cộng số dư ví và trả về số dư mới", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 300000);
      const newBalance = customer.credit(150000);

      expect(newBalance).toBe(450000);
      expect(customer.getBalance()).toBe(450000);
    });

    it("Testcase 37: credit với số tiền âm hoặc bằng 0 ném InvalidNum và số dư không đổi", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 300000);

      expect(() => customer.credit(0)).toThrow(InvalidNum);
      expect(() => customer.credit(-50000)).toThrow(InvalidNum);
      expect(customer.getBalance()).toBe(300000);
    });

    it("Testcase 38: credit với số tiền không nguyên ném InvalidNum và số dư không đổi", () => {
      const customer = new Customer("cust-1", "user@test.com", "User", now, now, 300000);

      expect(() => customer.credit(50.5)).toThrow(InvalidNum);
      expect(customer.getBalance()).toBe(300000);
    });
  });
});

describe("OrderItem Model Tests (Phase 2)", () => {
  describe("Constructor & Validation", () => {
    it("Testcase 39: Khởi tạo OrderItem hợp lệ thành công", () => {
      const item = new OrderItem("prod-1", 3, 150000);

      expect(item.productId).toBe("prod-1");
      expect(item.quantity).toBe(3);
      expect(item.unitPrice).toBe(150000);
    });

    it("Testcase 40: Constructor ném InvalidQuantityError khi quantity <= 0", () => {
      expect(() => new OrderItem("prod-1", 0, 150000)).toThrow(InvalidQuantityError);
      expect(() => new OrderItem("prod-1", -2, 150000)).toThrow(InvalidQuantityError);
    });

    it("Testcase 41: Constructor ném InvalidNum khi quantity không nguyên", () => {
      expect(() => new OrderItem("prod-1", 2.5, 150000)).toThrow(InvalidQuantityError);
    });

    it("Testcase 42: Constructor ném InvalidNum khi unitPrice < 0 hoặc không nguyên", () => {
      expect(() => new OrderItem("prod-1", 2, -50000)).toThrow(InvalidNum);
      expect(() => new OrderItem("prod-1", 2, 49999.5)).toThrow(InvalidNum);
    });
  });

  describe("lineTotal()", () => {
    it("Testcase 43: lineTotal tính đúng quantity * unitPrice", () => {
      const item = new OrderItem("prod-1", 4, 250000);
      expect(item.lineTotal()).toBe(1000000);
    });

    it("Testcase 44: lineTotal với unitPrice = 0 trả về 0 (hàng tặng kèm)", () => {
      const item = new OrderItem("prod-1", 2, 0);
      expect(item.lineTotal()).toBe(0);
    });
  });
});

describe("Order Model Tests (Phase 2)", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  describe("Constructor & Validation", () => {
    it("Testcase 45: Khởi tạo Order với mảng items rỗng ném EmptyOrderError", () => {
      expect(
        () =>
          new Order({
            id: "order-1",
            requestId: "req-1",
            customerId: "cust-1",
            items: [],
            subtotal: 100000,
            discountCode: null,
            discountAmount: 0,
            shippingFee: 20000,
            total: 120000,
            paymentMethodName: "WALLET",
            createdAt: now,
            updatedAt: now,
          }),
      ).toThrow(EmptyOrderError);
    });

    it("Testcase 46: Khởi tạo Order hợp lệ nhận đúng các giá trị mặc định chuẩn", () => {
      const item = new OrderItem("prod-1", 2, 100000);
      const order = new Order({
        id: "order-1",
        requestId: "req-1",
        customerId: "cust-1",
        items: [item],
        subtotal: 200000,
        discountCode: null,
        discountAmount: 0,
        shippingFee: 30000,
        total: 230000,
        paymentMethodName: "WALLET",
        createdAt: now,
        updatedAt: now,
      });

      expect(order.id).toBe("order-1");
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentId).toBeNull();
      expect(order.trackingCode).toBeNull();
      expect(order.paidAt).toBeNull();
      expect(order.deliveredAt).toBeNull();
      expect(order.failureReason).toBeNull();
      expect(order.items.length).toBe(1);
    });

    it("Testcase 47: Khởi tạo Order với status và tracking/payment tùy chọn", () => {
      const item = new OrderItem("prod-1", 1, 50000);
      const order = new Order({
        id: "order-2",
        requestId: "req-2",
        customerId: "cust-1",
        items: [item],
        subtotal: 50000,
        discountCode: "DISC10",
        discountAmount: 5000,
        shippingFee: 15000,
        total: 60000,
        paymentMethodName: "CARD",
        status: OrderStatus.PAID,
        paymentId: "PAY-123",
        trackingCode: "SHIP-456",
        paidAt: now,
        createdAt: now,
        updatedAt: now,
      });

      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentId).toBe("PAY-123");
      expect(order.trackingCode).toBe("SHIP-456");
      expect(order.paidAt).toBe(now);
    });

    it("Testcase 48: items trong Order là bản sao nông, thay đổi mảng gốc không ảnh hưởng Order", () => {
      const item1 = new OrderItem("prod-1", 1, 100000);
      const item2 = new OrderItem("prod-2", 2, 50000);
      const externalItems = [item1];

      const order = new Order({
        id: "order-1",
        requestId: "req-1",
        customerId: "cust-1",
        items: externalItems,
        subtotal: 100000,
        discountCode: null,
        discountAmount: 0,
        shippingFee: 20000,
        total: 120000,
        paymentMethodName: "WALLET",
        createdAt: now,
        updatedAt: now,
      });

      // Thêm phần tử vào mảng bên ngoài
      externalItems.push(item2);

      expect(order.items.length).toBe(1);
      expect(order.items[0]?.productId).toBe("prod-1");
    });
  });

  describe("Order.computeTotal(...)", () => {
    it("Testcase 49: computeTotal tính chuẩn subtotal - discountAmount + shippingFee", () => {
      const total = Order.computeTotal(500000, 50000, 30000);
      expect(total).toBe(480000);
    });

    it("Testcase 50: computeTotal khi discountAmount bằng đúng subtotal", () => {
      const total = Order.computeTotal(200000, 200000, 25000);
      expect(total).toBe(25000);
    });

    it("Testcase 51: computeTotal khi discountAmount lớn hơn subtotal + shippingFee trả về 0", () => {
      const total = Order.computeTotal(100000, 150000, 20000);
      expect(total).toBe(0);
    });

    it("Testcase 52: computeTotal khi mọi giá trị bằng 0 trả về 0", () => {
      const total = Order.computeTotal(0, 0, 0);
      expect(total).toBe(0);
    });
  });
});

