# 🛒 Mini E-commerce Order System (TypeScript OOP Advanced)

Hệ thống mô phỏng đặt hàng thương mại điện tử (kho hàng, ví điện tử, cổng thanh toán, giao hàng, sự kiện) áp dụng các nguyên lý lập trình hướng đối tượng (OOP) nâng cao, Clean Architecture và Design Patterns trong TypeScript.

---

## 1. Giới thiệu

Dự án rèn luyện các kỹ thuật TypeScript và kiến trúc phần mềm nâng cao:
- **Generics & Interface Segregation**: Tầng lưu trữ `IRepository<T>` độc lập và type-safe.
- **State Pattern mang dữ liệu**: Quản lý vòng đời đơn hàng chặt chẽ qua 7 trạng thái và 42 ma trận chuyển trạng thái.
- **Strategy Pattern**: Linh hoạt mở rộng giảm giá (`DiscountStrategy`), phí giao hàng (`ShippingFeeStrategy`), và phương thức thanh toán (`PaymentMethod`).
- **Dependency Injection**: Không phụ thuộc trực tiếp vào triển khai bên ngoài; hỗ trợ test cô lập và giả lập thời gian (`FakeClock`), sinh ID (`SequentialIdGenerator`).
- **Validate trước – Ghi sau (Two-Phase Execution)**: Đảm bảo tính toàn vẹn dữ liệu, tách bạch hoàn toàn giữa đọc kiểm tra và ghi nhận thay đổi.
- **Compensation / Saga Rollback**: Cơ chế hoàn tác `CompensationStack` tự động rollback khi gặp sự cố giữa chừng.
- **Resilience & Concurrency**: Retry với exponential backoff, timeout an toàn, xử lý idempotency qua `requestId` và race conditions.
- **Typed Event-Driven**: Bắn sự kiện an toàn kiểu dữ liệu với `TypedEventEmitter` mà không làm vỡ luồng nghiệp vụ.

---

## 2. Cài đặt & Chạy

### Yêu cầu môi trường
- Node.js >= 18
- npm / yarn / pnpm

### Cài đặt dependencies
```bash
npm install
```

### Kiểm tra kiểu dữ liệu (Type-check)
```bash
npm run typecheck
```

### Chạy kiểm thử tự động (Unit & Integration tests)
```bash
npm test
# hoặc chạy chế độ watch:
npm run test:watch
```

### Chạy kịch bản mẫu (Demo CLI)
```bash
npm start
```

---

## 3. Kiến trúc Hệ thống

### Cấu trúc thư mục
```
OrderSystem/
├── src/
│   ├── models/           # Domain entities (Product, Customer, Order, OrderItem)
│   ├── enums/            # OrderStatus, PaymentStatus
│   ├── errors/           # DomainErrors kế thừa DomainError
│   ├── repository/       # IRepository và InMemoryRepository
│   ├── states/           # OrderState và 7 state classes
│   ├── strategies/       # Discount, ShippingFee, PaymentMethod strategies
│   ├── infra/            # Clock, IdGenerator, PaymentGateway, ShippingApi, CompensationStack
│   ├── utils/            # Resilience (withTimeout, withRetry)
│   ├── events/           # TypedEventEmitter, OrderEvents và Listeners
│   ├── services/         # OrderService điều phối nghiệp vụ
│   └── main.ts           # Điểm khởi chạy kịch bản mẫu
├── test/
│   ├── helpers/          # Snapshot, fixtures
│   └── *.test.ts         # Test suites cho từng Phase
├── OrderSystem_Roadmap.md# Lộ trình chi tiết từng Phase
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 4. Các kịch bản Demo

1. **Đơn thanh toán ví thành công**: Áp dụng mã giảm giá, kiểm tra trừ tồn kho và số dư ví.
2. **Đơn thanh toán thẻ (Retry thành công)**: Giả lập cổng thanh toán lỗi tạm thời, retry thành công.
3. **Đơn thanh toán thẻ thất bại**: Rollback toàn bộ trạng thái giữ chỗ kho (reserved stock) về nguyên trạng.
4. **Đơn vượt tồn kho**: Báo lỗi `OutOfStockError` ngay tại bước validate, không giữ hàng thừa.
5. **Hủy đơn hàng**: Hoàn tiền về ví/cổng thanh toán và hoàn trả hàng về kho.
6. **Vòng đời hoàn chỉnh**: Đặt hàng → Giao hàng → Nhận hàng → Trả hàng trong thời hạn quy định.
7. **Idempotency**: Gửi 2 yêu cầu cùng `requestId`, hệ thống nhận diện và không tạo đơn trùng lặp.
8. **Thống kê & Sự kiện**: `StatsListener` tổng hợp doanh thu, đơn hàng theo thời gian thực.

---

## 5. Bài học kinh nghiệm

*(Sẽ cập nhật sau khi hoàn thành các phase)*
