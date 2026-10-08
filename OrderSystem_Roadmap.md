# 🛒 Mini E-commerce Order System — Detailed Learning Roadmap (TypeScript OOP Advanced)

> **Mục tiêu**: Xây dựng hệ thống đặt hàng (kho hàng, ví, thanh toán, giao hàng, thông báo) bằng TypeScript nâng cao. Dự án này luyện chắc: **Generics + Interface**, **State Pattern mang dữ liệu**, **Strategy Pattern**, **Dependency Injection**, **"validate trước – ghi sau"**, **Rollback (Compensation/Saga)**, **Async nâng cao (timeout, retry, idempotency)**, **Typed Event-Driven**, **Test nhánh lỗi**, và cuối cùng là **chuyển sang backend thật có database + transaction**.

> **Cách đọc tài liệu này**: mọi phase đều tự mô tả đầy đủ từng file, từng method, từng bước, từng test. Không có phần nào yêu cầu "làm giống dự án khác". Chỉ cần làm theo thứ tự phase, hết phase nào thì `npm test` phải xanh và commit riêng.

---

## 📏 LUẬT CỨNG CỦA DỰ ÁN (áp dụng cho MỌI phase)

1. **Cấm `any` và cấm kiểu `Function`**. Callback phải có chữ ký đầy đủ, ví dụ `(data: T) => void`. Bật `strict: true` và chạy `npx tsc --noEmit` phải sạch trước mỗi commit.
2. **Validate trước – ghi sau**. Mỗi hàm nghiệp vụ chia 2 khối rõ ràng, có comment `// ===== VALIDATE =====` và `// ===== MUTATE =====`. Khối VALIDATE chỉ đọc, tuyệt đối không thay đổi bất kỳ dữ liệu nào, kể cả trên bản sao. Chỉ khi khối VALIDATE chạy xong mới được sang khối MUTATE.
3. **Mọi thay đổi có thể hỏng giữa chừng phải có cách hoàn tác** (xem Phase 5 và 6).
4. **Không dùng `new` cho dịch vụ bên ngoài ngay trong service**. Cổng thanh toán, API giao hàng, đồng hồ, bộ sinh ID đều phải được **tiêm (inject) qua constructor**.
5. **Mỗi lỗi nghiệp vụ là một class riêng** kế thừa `DomainError`, có `name` đúng tên class, `instanceof` hoạt động. Cấm `throw new Error("...")` chung chung trong code nghiệp vụ.
6. **Tiền là số nguyên (đơn vị VND)**, không dùng số thực. Mọi phép tính tiền phải ra số nguyên.
7. **Không test nào được chờ delay thật quá 50ms**. Dùng `vi.useFakeTimers()` hoặc tiêm `sleep` giả.
8. **Mỗi nhánh lỗi có ít nhất 1 test chứng minh dữ liệu sau lỗi y hệt như trước khi gọi** (xem Phase 10 về helper `snapshot`).
9. **Tên thuộc tính thời gian là `createdAt` / `updatedAt`** (quá khứ phân từ, đúng chính tả).
10. **Mỗi phase = ít nhất 1 commit riêng**, message rõ ràng, ví dụ `feat(phase-3): order state machine`.

---

## 🏗️ Tổng quan Kiến trúc Hệ thống

```
OrderSystem/
├── src/
│   ├── models/
│   │   ├── Entity.ts              ← Base interface: id, createdAt, updatedAt
│   │   ├── Product.ts             ← Sản phẩm + tồn kho + hàng đang giữ chỗ
│   │   ├── Customer.ts            ← Khách hàng + số dư ví
│   │   ├── Order.ts               ← Đơn hàng
│   │   └── OrderItem.ts           ← Một dòng hàng trong đơn
│   ├── enums/
│   │   ├── OrderStatus.ts
│   │   └── PaymentStatus.ts
│   ├── errors/
│   │   └── DomainErrors.ts        ← DomainError + toàn bộ lỗi nghiệp vụ
│   ├── repository/
│   │   ├── IRepository.ts
│   │   └── InMemoryRepository.ts
│   ├── states/
│   │   ├── OrderState.ts
│   │   ├── PendingState.ts / PaidState.ts / ShippedState.ts
│   │   ├── DeliveredState.ts / CancelledState.ts / RefundedState.ts / FailedState.ts
│   │   └── OrderStateFactory.ts
│   ├── strategies/
│   │   ├── DiscountStrategy.ts    ← interface + PercentageDiscount + FixedAmountDiscount
│   │   ├── ShippingFeeStrategy.ts ← interface + FlatShippingFee + FreeShippingAboveThreshold
│   │   └── PaymentMethod.ts       ← interface + WalletPaymentMethod + CardPaymentMethod
│   ├── infra/
│   │   ├── Clock.ts               ← interface Clock + SystemClock + FakeClock
│   │   ├── IdGenerator.ts         ← interface + SimpleIdGenerator + SequentialIdGenerator (test)
│   │   ├── PaymentGateway.ts      ← interface + FakePaymentGateway (có thể lỗi/chậm)
│   │   ├── ShippingApi.ts         ← interface + FakeShippingApi
│   │   └── CompensationStack.ts   ← Cơ chế hoàn tác
│   ├── utils/
│   │   └── resilience.ts          ← withTimeout, withRetry
│   ├── events/
│   │   ├── TypedEventEmitter.ts
│   │   ├── OrderEvents.ts         ← bảng kiểu: tên event → kiểu data
│   │   └── listeners/             ← NotificationListener, StatsListener, AuditLogListener
│   ├── services/
│   │   └── OrderService.ts        ← Business logic điều phối
│   └── main.ts                    ← Chạy thử toàn bộ kịch bản
├── test/
│   ├── helpers/ (snapshot.ts, fixtures.ts)
│   ├── Repository.test.ts / Models.test.ts / OrderState.test.ts
│   ├── Strategies.test.ts / CompensationStack.test.ts / Resilience.test.ts
│   ├── OrderService.place.test.ts / OrderService.lifecycle.test.ts
│   ├── OrderService.concurrency.test.ts / TypedEventEmitter.test.ts
│   └── Integration.test.ts
├── README.md  ·  .gitignore  ·  tsconfig.json  ·  vitest.config.ts  ·  package.json
```

---

## 📌 PHASE 0 — Khởi tạo dự án & môi trường

> **Mục tiêu**: Có bộ khung sạch, chạy được test và type-check ngay từ đầu.

### 🎯 Các bước thực hiện:

1. `npm init -y`, cài `typescript`, `vitest`, `tsx` (devDependencies).
2. **`tsconfig.json`**: `target: ES2020`, `module: ES2020`, `moduleResolution: bundler`, `strict: true`, `noImplicitOverride: true`, `noUncheckedIndexedAccess: true`, `include: ["src/**/*", "test/**/*"]`.
3. **`vitest.config.ts`**: `globals: true`.
4. **`package.json` scripts**: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`, `"start": "tsx src/main.ts"`. **Bắt buộc tạo `src/main.ts`** (dù chỉ in một dòng) ngay bây giờ để `npm start` không bao giờ bị lỗi.
5. **`.gitignore`**: `node_modules/`, `dist/`, `*.log`, `.DS_Store`, `coverage/`, thư mục công cụ AI/tooling cá nhân (ví dụ `.agents/`), file lock của tooling cá nhân, thư mục báo cáo sinh tự động (ví dụ `test-reports/`). Không commit bất cứ thứ gì không phải mã nguồn, test hoặc tài liệu.
6. **`README.md`**: tạo khung với 5 đề mục (Giới thiệu, Cài đặt & chạy, Kiến trúc, Các kịch bản demo, Bài học). Lưu file bằng **UTF-8** (không phải UTF-16). Điền nội dung dần ở mỗi phase.
7. Không để đường dẫn tuyệt đối của máy cá nhân (ví dụ `d:/Project/...`) trong bất kỳ file nào được commit.

✅ **Nghiệm thu**: `npm test` (chưa có test cũng không lỗi cấu hình), `npm run typecheck`, `npm start` đều chạy được.

---

## 📌 PHASE 1 — Nền tảng: Entity, Enum, Error, Infra nhỏ, Generic Repository

> **Mục tiêu**: Viết tầng lưu trữ dùng chung bằng **Generics** và **lập trình theo interface** thật sự (class phải `implements` interface).

### 🎯 Các bước thực hiện:

1. **`models/Entity.ts`**: `interface Entity { id: string; createdAt: Date; updatedAt: Date }`.

2. **Enum** (thư mục `enums/`):
   - `OrderStatus`: `PENDING | PAID | SHIPPED | DELIVERED | CANCELLED | REFUNDED | FAILED` (giá trị chuỗi trùng tên).
   - `PaymentStatus`: `SUCCESS | FAILED | UNKNOWN`.

3. **`infra/Clock.ts`**:
   - `interface Clock { now(): Date }`
   - `class SystemClock implements Clock` trả `new Date()`.
   - `class FakeClock implements Clock` có constructor nhận `Date` khởi điểm, thêm `advanceDays(n: number)`, `advanceMs(ms: number)`, `set(date: Date)`.

4. **`infra/IdGenerator.ts`**:
   - `interface IdGenerator { next(prefix: string): string }`
   - `SimpleIdGenerator`: trả `` `${prefix}-${clock.now().getTime()}-${randomInt}` `` (nhận `Clock` qua constructor).
   - `SequentialIdGenerator`: trả `PREFIX-1`, `PREFIX-2`... (dùng trong test cho kết quả ổn định).
   - Mọi entity mới tạo đều lấy ID từ `IdGenerator`, không gán chuỗi cứng trong code nghiệp vụ.

5. **`errors/DomainErrors.ts`**:
   - `abstract class DomainError extends Error`: constructor nhận `message`; trong constructor gọi `Object.setPrototypeOf(this, new.target.prototype)` và gán `this.name = new.target.name`. Các field thông tin là **`readonly` public** (không `private`) để tầng trên đọc được.
   - Tạo sẵn các lỗi sau (mỗi lỗi một class, message tiếng Việt rõ nghĩa, có field thông tin tương ứng):
     `DuplicateEntityError(id)`, `ProductNotFoundError(productId)`, `CustomerNotFoundError(customerId)`, `OrderNotFoundError(orderId)`, `EmptyOrderError()`, `InvalidQuantityError(productId, quantity)`, `OutOfStockError(productId, requested, available)`, `InsufficientBalanceError(customerId, required, available)`, `InvalidDiscountError(code, reason)`, `InvalidOrderTransitionError(orderId, from, action)`, `PaymentFailedError(reason, retryable: boolean)`, `PaymentTimeoutError(timeoutMs)`, `UnknownPaymentMethodError(name)`, `ShippingFailedError(reason)`, `RefundWindowExpiredError(orderId, windowDays)`, `IdempotencyConflictError(requestId)`.

6. **`repository/IRepository.ts`**:

   ```ts
   export interface IRepository<T extends Entity> {
     add(item: T): void; // id trùng → throw DuplicateEntityError
     findById(id: string): T | null;
     findAll(): T[];
     update(id: string, patch: UpdatePatch<T>): boolean; // không tồn tại → false
     delete(id: string): boolean;
     filter(predicate: (item: T) => boolean): T[];
   }
   export type UpdatePatch<T extends Entity> = Partial<
     Omit<T, "id" | "createdAt">
   >;
   ```

7. **`repository/InMemoryRepository.ts`** — `class InMemoryRepository<T extends Entity> implements IRepository<T>` (bắt buộc có từ khóa `implements`):
   - Constructor nhận `clock: Clock` (để gán `updatedAt`).
   - `private items: T[]`.
   - Hàm private `clone(item: T): T`: tạo object mới giữ nguyên prototype (`Object.create(Object.getPrototypeOf(item))`), copy field, **sao chép sâu** các `Date` và mảng (nếu chỉ copy nông thì bên ngoài sửa được dữ liệu bên trong). Mọi dữ liệu vào (`add`) và ra (`findById`, `findAll`, `filter`) đều đi qua `clone`.
   - `update`: chỉ ghi các field **có mặt trong `patch`**; không bao giờ ghi `id` và `createdAt` kể cả khi caller ép kiểu truyền vào (chủ động loại bỏ bằng code, không dùng `Object.assign` thẳng với patch). Sau khi ghi gán `updatedAt = clock.now()`.
   - `filter`: gọi `predicate` trên bản clone, không trên object gốc.

✅ **Test Phase 1** (`Repository.test.ts`) — dùng một entity giả `{id, createdAt, updatedAt, name}`:

- `add` rồi `findById` trả đúng dữ liệu; `add` trùng id → throw `DuplicateEntityError` và số lượng không đổi.
- Sửa object trả về từ `findById` **không** làm thay đổi dữ liệu trong repo; sửa object truyền vào `add` sau khi add cũng không ảnh hưởng.
- `update` chỉ đổi đúng field truyền vào; cố truyền `id` hoặc `createdAt` trong patch (ép kiểu bằng `as`) → hai field này không đổi; `updatedAt` đổi theo `FakeClock`.
- `update`/`delete` id không tồn tại → `false`. `delete` xong `findById` → `null`.
- `filter` trả bản sao; đổi kết quả không ảnh hưởng repo.
- Kiểm tra mảng bên trong entity (nếu có) cũng được sao chép sâu.

---

## 📌 PHASE 2 — Domain Models

> **Mục tiêu**: Model có hành vi thật, bảo vệ chính nó (đóng gói), không để bên ngoài tự gán tùy tiện.

### 🎯 Các bước thực hiện:

1. **`models/Product.ts`** — `Product implements Entity`: `id, name, price (VND, số nguyên), stock, reservedStock, createdAt, updatedAt`.
   - `getAvailable(): number` → `stock - reservedStock`.
   - `reserve(qty)`: nếu `qty` không phải số nguyên dương → `InvalidQuantityError`; nếu `qty > getAvailable()` → `OutOfStockError`; ngược lại `reservedStock += qty`.
   - `release(qty)`: giảm `reservedStock` (không cho xuống dưới 0; nếu `qty > reservedStock` → `InvalidQuantityError`).
   - `commit(qty)`: bán thật sự — `stock -= qty` và `reservedStock -= qty` (yêu cầu `qty <= reservedStock`).
   - `restock(qty)`: `stock += qty` (dùng khi hủy/hoàn hàng).
   - Constructor validate: `price >= 0` nguyên, `stock >= 0` nguyên, `reservedStock === 0` khi tạo mới (nếu không → `InvalidQuantityError`).

2. **`models/Customer.ts`** — `Customer implements Entity`: `id, name, email, createdAt, updatedAt`, và `private walletBalance: number`.
   - `getBalance(): number`.
   - `canAfford(amount): boolean`.
   - `debit(amount)`: `amount` phải nguyên dương; nếu số dư không đủ → `InsufficientBalanceError`; ngược lại trừ tiền.
   - `credit(amount)`: `amount` nguyên dương; cộng tiền.
   - Constructor validate số dư ban đầu `>= 0` và nguyên.

3. **`models/OrderItem.ts`** — value object bất biến: `productId, quantity, unitPrice` (đều `readonly`), method `lineTotal() = quantity * unitPrice`. `unitPrice` là **giá chụp tại thời điểm đặt** (giá sản phẩm đổi sau này không ảnh hưởng đơn cũ).

4. **`models/Order.ts`** — `Order implements Entity`. Field:
   `id, requestId, customerId, items: readonly OrderItem[], subtotal, discountCode: string | null, discountAmount, shippingFee, total, paymentMethodName: string, status: OrderStatus, paymentId: string | null, trackingCode: string | null, paidAt: Date | null, deliveredAt: Date | null, failureReason: string | null, createdAt, updatedAt`.
   - Order **lưu mọi dữ liệu của vòng đời** (paymentId, trackingCode, paidAt, deliveredAt) ngay trên chính nó. Đây là quy tắc quan trọng cho Phase 3: các State là đối tượng _không giữ dữ liệu riêng_, chỉ đọc/ghi dữ liệu trên Order.
   - Constructor nhận một object options (`OrderOptions`) thay vì 15 tham số rời. Mặc định `status = PENDING`, các field nullable = `null`.
   - Method thuần tính toán: `static computeTotal(subtotal, discountAmount, shippingFee): number` = `subtotal - discountAmount + shippingFee`, và luôn `>= 0`.

✅ **Test Phase 2** (`Models.test.ts`): mọi method của Product / Customer / OrderItem / Order ở trên, gồm các biên: `qty = 0`, `qty = -1`, `qty = 1.5`, đặt đúng bằng số còn lại, đặt hơn 1 đơn vị, `release` quá mức, `debit` đúng bằng số dư (cho phép, còn 0), `debit` hơn 1đ (lỗi, số dư giữ nguyên), `computeTotal` khi giảm giá bằng đúng tổng.

---

## 📌 PHASE 3 — State Pattern cho Order (State mang dữ liệu)

> **Mục tiêu**: Mỗi trạng thái tự quyết hành động nào hợp lệ, và **dữ liệu đi kèm trạng thái được lưu trên Order, truyền vào method qua tham số** — không bao giờ để State tự giữ dữ liệu với giá trị mặc định rỗng.

### 🎯 Bảng chuyển trạng thái hợp lệ (viết test cho TỪNG ô trong bảng)

| Trạng thái hiện tại           | `pay`  | `ship`    | `deliver`   | `cancel`    | `refund`   | `fail`   |
| ----------------------------- | ------ | --------- | ----------- | ----------- | ---------- | -------- |
| PENDING                       | → PAID | ✗         | ✗           | → CANCELLED | ✗          | → FAILED |
| PAID                          | ✗      | → SHIPPED | ✗           | → CANCELLED | ✗          | ✗        |
| SHIPPED                       | ✗      | ✗         | → DELIVERED | ✗           | ✗          | ✗        |
| DELIVERED                     | ✗      | ✗         | ✗           | ✗           | → REFUNDED | ✗        |
| CANCELLED / REFUNDED / FAILED | ✗      | ✗         | ✗           | ✗           | ✗          | ✗        |

(✗ = throw `InvalidOrderTransitionError(order.id, order.status, tênHànhĐộng)`)

### 🎯 Các bước thực hiện:

1. **`states/OrderState.ts`**:
   ```ts
   export interface OrderState {
     pay(order: Order, paymentId: string, at: Date): void;
     ship(order: Order, trackingCode: string): void;
     deliver(order: Order, at: Date): void;
     cancel(order: Order): void;
     refund(order: Order): void;
     fail(order: Order, reason: string): void;
   }
   ```
2. Cài đặt **7 class**: `PendingState`, `PaidState`, `ShippedState`, `DeliveredState`, `CancelledState`, `RefundedState`, `FailedState`, mỗi class `implements OrderState`. Hành động hợp lệ theo bảng trên: đổi `order.status` **và ghi dữ liệu kèm theo** (`pay` ghi `paymentId`, `paidAt`; `ship` ghi `trackingCode`; `deliver` ghi `deliveredAt`; `fail` ghi `failureReason`). Hành động không hợp lệ: throw `InvalidOrderTransitionError`. Các State **không có field riêng**, constructor rỗng.
3. **`states/OrderStateFactory.ts`**: `getState(status: OrderStatus): OrderState`, có `switch` đầy đủ trên toàn bộ giá trị enum, nhánh `default` dùng kiểm tra `never` để compiler báo lỗi nếu sau này thêm trạng thái mà quên cài state. **Không** throw `Error` chung cho trạng thái nào cả — mọi trạng thái đều có State riêng.
4. Mọi code ngoài (service) **chỉ** đổi trạng thái đơn qua `OrderStateFactory.getState(order.status).xxx(order, ...)`. Cấm gán `order.status = ...` trực tiếp ở ngoài thư mục `states/`.

✅ **Test Phase 3** (`OrderState.test.ts`): dùng `it.each` duyệt toàn bộ **7 trạng thái × 6 hành động = 42 ô** của bảng; ô hợp lệ kiểm tra `status` mới và dữ liệu kèm theo (ví dụ sau `pay` thì `paymentId` và `paidAt` đúng); ô không hợp lệ kiểm tra throw đúng lỗi, đúng message chứa trạng thái hiện tại, và **order không bị thay đổi gì**.

---

## 📌 PHASE 4 — Strategy Pattern (giảm giá, phí ship, phương thức thanh toán)

> **Mục tiêu**: Tách các cách tính/cách làm khác nhau thành các class hoán đổi được qua interface.

### 🎯 Các bước thực hiện:

1. **`strategies/DiscountStrategy.ts`**:
   - `interface DiscountStrategy { readonly code: string; calculate(subtotal: number): number; }`
   - `PercentageDiscount(code, percent, maxDiscount?)`: `percent` trong `(0, 100]`; kết quả `Math.floor(subtotal * percent / 100)`, tối đa `maxDiscount` nếu có.
   - `FixedAmountDiscount(code, amount)`: giảm `amount`, nhưng không vượt `subtotal`.
   - Constructor sai tham số (percent ≤ 0 hoặc > 100, amount ≤ 0, không nguyên) → throw `InvalidDiscountError`.
   - `class DiscountCatalog`: `register(strategy)`, `find(code): DiscountStrategy` (không có → throw `InvalidDiscountError(code, "Mã không tồn tại")`). Mã không phân biệt hoa thường.
   - Quy tắc chung: kết quả `calculate` luôn là số nguyên, `0 <= kết quả <= subtotal`.

2. **`strategies/ShippingFeeStrategy.ts`**:
   - `interface ShippingFeeStrategy { calculate(subtotal: number): number }`
   - `FlatShippingFee(fee)`: luôn trả `fee`.
   - `FreeShippingAboveThreshold(threshold, baseFee)`: `subtotal >= threshold` → 0, ngược lại `baseFee`.

3. **`strategies/PaymentMethod.ts`** — thanh toán là một Strategy có 3 thao tác:

   ```ts
   export interface PaymentResult {
     paymentId: string;
   }
   export interface PaymentMethod {
     readonly name: string; // "WALLET" | "CARD"
     validate(customer: Customer, amount: number): void; // CHỈ ĐỌC, throw nếu không thể trả
     charge(
       customer: Customer,
       amount: number,
       idempotencyKey: string,
     ): Promise<PaymentResult>;
     refund(
       customer: Customer,
       amount: number,
       paymentId: string,
     ): Promise<void>;
   }
   ```

   - `WalletPaymentMethod`: `validate` kiểm tra `canAfford` (không đủ → `InsufficientBalanceError`); `charge` gọi `customer.debit` (sync bên trong nhưng trả Promise) và trả `paymentId` dạng `WAL-<idempotencyKey>`; `refund` gọi `customer.credit`. Lưu ý: vì `Customer` là bản sao lấy từ repo, phương thức này **không tự lưu repo** — service chịu trách nhiệm lưu (xem Phase 6).
   - `CardPaymentMethod(gateway: PaymentGateway)`: `validate` không làm gì (cổng ngoài quyết định); `charge` gọi `gateway.charge(...)`; `refund` gọi `gateway.refund(...)`.
   - `PaymentGateway` được định nghĩa ở Phase 5.

✅ **Test Phase 4** (`Strategies.test.ts`): từng strategy ở các biên (subtotal = 0; discount bằng đúng subtotal; percent = 100; maxDiscount chặn trần; mã sai tham số; catalog tìm hoa/thường; mã không tồn tại; ngưỡng free-ship đúng bằng ngưỡng, thấp hơn 1đ).

---

## 📌 PHASE 5 — Hạ tầng giả lập & cơ chế hoàn tác (Compensation)

> **Mục tiêu**: Có "thế giới bên ngoài" giả lập điều khiển được trong test, và một cơ chế hoàn tác tổng quát cho luồng nhiều bước.

### 🎯 Các bước thực hiện:

1. **`infra/PaymentGateway.ts`**:

   ```ts
   export interface PaymentGateway {
     charge(
       amount: number,
       idempotencyKey: string,
     ): Promise<{ paymentId: string }>;
     refund(paymentId: string, amount: number): Promise<void>;
     getChargeStatus(idempotencyKey: string): Promise<PaymentStatus>; // SUCCESS | FAILED | UNKNOWN
   }
   ```

   - `FakePaymentGateway implements PaymentGateway`, nhận `sleep: (ms: number) => Promise<void>` qua constructor (test truyền hàm trả Promise tức thời) và có thể cấu hình:
     - `setLatency(ms)`: độ trễ mỗi lần gọi.
     - `failNext(times: number, error: PaymentFailedError)`: N lần gọi `charge` kế tiếp ném lỗi này (dùng để mô phỏng lỗi tạm thời `retryable: true` hoặc lỗi vĩnh viễn `retryable: false`).
     - `failAlways(error)` / `reset()`.
     - **Idempotent thật**: cùng `idempotencyKey` gọi 2 lần thì chỉ trừ một lần, trả cùng `paymentId` (lưu `Map<key, paymentId>`).
     - `getCallCount()`, `getChargedTotal()` để test kiểm tra không bị trừ tiền thừa.
     - Mô phỏng "timeout nhưng thực ra đã trừ tiền": cờ `completeButHang(true)` — gọi `charge` vẫn ghi nhận giao dịch thành công vào Map nhưng Promise không bao giờ resolve (hoặc resolve sau độ trễ rất lớn).

2. **`infra/ShippingApi.ts`**: `interface ShippingApi { createShipment(orderId: string): Promise<{ trackingCode: string }> }`; `FakeShippingApi` có `failNext(times, error: ShippingFailedError)` và `setLatency`.

3. **`infra/CompensationStack.ts`** — ngăn xếp hoàn tác:

   ```ts
   export class CompensationStack {
     push(label: string, undo: () => Promise<void> | void): void;
     async rollback(): Promise<RollbackReport>; // chạy NGƯỢC thứ tự push
     clear(): void; // gọi khi toàn bộ luồng thành công
     size(): number;
   }
   export interface RollbackReport {
     succeeded: string[];
     failed: { label: string; error: unknown }[];
   }
   ```

   - `rollback()` chạy từng `undo` theo thứ tự **ngược**; nếu một `undo` ném lỗi thì **vẫn tiếp tục** chạy các `undo` còn lại, ghi lỗi vào `failed`, không ném ra ngoài.
   - Sau `rollback()` ngăn xếp rỗng.

✅ **Test Phase 5** (`CompensationStack.test.ts` + test của Fake): thứ tự chạy ngược; một undo lỗi không chặn các undo khác; `clear` làm rollback không chạy gì; undo bất đồng bộ được `await` đúng thứ tự; `FakePaymentGateway` idempotent (gọi 2 lần cùng key → `getChargedTotal` chỉ tính một lần); `failNext(2)` rồi lần thứ 3 thành công.

---

## 📌 PHASE 6 — `OrderService.placeOrder` (phần lõi)

> **Mục tiêu**: Một nghiệp vụ đụng vào 4 thứ (Product, Customer, Order, Payment) với **validate trước – ghi sau** và **rollback đầy đủ** khi lỗi giữa chừng.

### 🎯 Khai báo

1. **`services/OrderService.ts`** — constructor nhận **một object dependencies** (không `new` bên trong):
   ```ts
   export interface OrderServiceDeps {
     productRepo: IRepository<Product>;
     customerRepo: IRepository<Customer>;
     orderRepo: IRepository<Order>;
     paymentMethods: Record<string, PaymentMethod>;   // {"WALLET": ..., "CARD": ...}
     discountCatalog: DiscountCatalog;
     shippingFee: ShippingFeeStrategy;
     shippingApi: ShippingApi;
     clock: Clock;
     ids: IdGenerator;
   }
   export interface PlaceOrderRequest {
     requestId: string;
     customerId: string;
     items: { productId: string; quantity: number }[];
     paymentMethod: string;          // "WALLET" | "CARD"
     discountCode?: string;
   }
   async placeOrder(req: PlaceOrderRequest): Promise<Order>
   ```

### 🎯 Thuật toán `placeOrder` (làm đúng thứ tự)

**// ===== VALIDATE ===== (chỉ đọc, không thay đổi gì)**

- V1. `req.items` rỗng → throw `EmptyOrderError`.
- V2. Gộp các dòng trùng `productId` (cộng dồn số lượng). Mỗi `quantity` phải là số nguyên dương, nếu không → `InvalidQuantityError`.
- V3. `customerRepo.findById` → `null` thì `CustomerNotFoundError`.
- V4. Với từng sản phẩm: `productRepo.findById` → `null` thì `ProductNotFoundError`; kiểm tra `quantity <= product.getAvailable()` (đọc, **chưa reserve**) → không đủ thì `OutOfStockError`.
- V5. Tìm `paymentMethods[req.paymentMethod]` → không có thì `UnknownPaymentMethodError`.
- V6. Nếu có `discountCode` → `discountCatalog.find(code)` (sai mã → `InvalidDiscountError`).
- V7. Tính tiền (số nguyên): `subtotal = Σ quantity × product.price`; `discountAmount = strategy ? strategy.calculate(subtotal) : 0`; `shippingFee = shippingFee.calculate(subtotal - discountAmount)`; `total = Order.computeTotal(...)`.
- V8. `paymentMethod.validate(customer, total)` (ví: không đủ tiền → `InsufficientBalanceError`).

**// ===== MUTATE =====** (tạo `const undo = new CompensationStack()`; toàn bộ khối bọc `try { ... } catch (e) { await undo.rollback(); ...; throw e; }`)

- M1. **Reserve hàng** cho từng sản phẩm: lấy lại product từ repo, `product.reserve(qty)`, `productRepo.update(...)` lưu `reservedStock`. Sau mỗi sản phẩm `undo.push("release-stock:<id>", () => release + lưu lại)`. **Toàn bộ M1 và M2 phải chạy đồng bộ, không có `await` nào trước khi reserve xong** (lý do ở Phase 8).
- M2. Tạo `Order` với `status = PENDING`, `id = ids.next("ORDER")`, các số tiền ở V7; `orderRepo.add(order)`; `undo.push("fail-order", () => đổi đơn sang FAILED bằng state.fail(order, reason) và lưu)`. (Đơn bị lỗi **không bị xóa** để còn lịch sử.)
- M3. `const result = await paymentMethod.charge(customer, total, order.id)` (dùng `order.id` làm `idempotencyKey`). Với ví: sau khi `charge`, **lưu lại customer** vào `customerRepo`. Ngay sau khi charge thành công: `undo.push("refund-payment", () => paymentMethod.refund(customer, total, result.paymentId) + lưu customer)`.
- M4. Đơn sang `PAID`: `OrderStateFactory.getState(order.status).pay(order, result.paymentId, clock.now())`, lưu repo. Với từng sản phẩm: `product.commit(qty)` (bán thật), lưu repo.
- M5. `undo.clear()`, trả `order`.

**Xử lý lỗi (`catch`)**: gọi `await undo.rollback()`; nếu có `RollbackReport.failed` thì **ghi lại** (ở Phase 9 sẽ bắn event `ROLLBACK_INCOMPLETE`; tạm thời `console.error`); rồi **ném lại lỗi gốc** (không nuốt lỗi, không bọc thành lỗi khác).

### ✅ Test Phase 6 (`OrderService.place.test.ts`)

Dùng `FakeClock`, `SequentialIdGenerator`, `FakePaymentGateway` (latency 0). Mỗi test lỗi **bắt buộc** gọi `snapshot` trước/sau (xem Phase 10) và `expect` hai bản bằng nhau (trừ đơn FAILED đã được tạo ở M2, kiểm tra riêng).

- **Happy path ví**: tồn kho giảm đúng, `reservedStock` về 0, số dư ví giảm đúng `total`, đơn `PAID` có `paymentId`/`paidAt`.
- **Happy path thẻ**: gateway được gọi đúng 1 lần với `order.id`.
- **Có mã giảm giá & free-ship**: kiểm tra chi tiết `subtotal / discountAmount / shippingFee / total`.
- **Từng lỗi VALIDATE (V1→V8)**: ném đúng loại lỗi **và không có bất kỳ thay đổi nào** (kể cả không tạo Order nào).
- **Lỗi giữa chừng — thanh toán thẻ thất bại** (`failAlways(retryable=false)`): ném đúng `PaymentFailedError`; `reservedStock` về như cũ; `stock` không đổi; có đúng 1 đơn `FAILED` với `failureReason`; gateway tổng tiền = 0.
- **Lỗi giữa chừng — thanh toán ví**: ví không bị trừ.
- **Một undo bị lỗi** (mô phỏng release lỗi): các undo còn lại vẫn chạy; lỗi gốc vẫn được ném.
- Đặt nhiều dòng hàng, dòng thứ 2 hết hàng ở bước V4 → không dòng nào bị reserve.

---

## 📌 PHASE 7 — Vòng đời đơn hàng: ship / deliver / cancel / refund

> **Mục tiêu**: Mở rộng service với các thao tác còn lại, tất cả đều tuân thủ "validate trước – ghi sau" và "gọi hệ thống ngoài trước, ghi nội bộ sau".

### 🎯 Các method (thêm vào `OrderService`)

Thêm vào `OrderServiceDeps`: `config: { refundWindowDays: number }` (mặc định 7).

1. **`async shipOrder(orderId): Promise<Order>`**
   - VALIDATE: tìm đơn (`OrderNotFoundError`); kiểm tra chuyển trạng thái hợp lệ **trước khi gọi API ngoài** (đơn phải đang `PAID`, nếu không → `InvalidOrderTransitionError`).
   - MUTATE: `await shippingApi.createShipment(order.id)` — **nếu API lỗi, đơn vẫn `PAID`, không đổi gì**; thành công thì `state.ship(order, trackingCode)` và lưu.
2. **`async deliverOrder(orderId): Promise<Order>`**: đơn `SHIPPED` → `DELIVERED` với `deliveredAt = clock.now()`.
3. **`async cancelOrder(orderId): Promise<Order>`**
   - VALIDATE: đơn tồn tại; trạng thái hiện tại phải cho phép `cancel` (PENDING hoặc PAID).
   - MUTATE (dùng `CompensationStack` giống Phase 6 để nếu bước sau lỗi thì bước trước được hoàn tác):
     - Nếu `PENDING`: `release` hàng đã giữ cho từng sản phẩm.
     - Nếu `PAID`: hoàn tiền (`paymentMethod.refund`) rồi `restock` từng sản phẩm.
     - Cuối cùng `state.cancel(order)`, lưu.
4. **`async refundOrder(orderId): Promise<Order>`** (trả hàng sau khi đã giao)
   - VALIDATE: đơn `DELIVERED`; `clock.now()` không quá `deliveredAt + refundWindowDays` ngày, nếu quá → `RefundWindowExpiredError`.
   - MUTATE: hoàn tiền → `restock` từng sản phẩm → `state.refund(order)`; có `CompensationStack`.
5. **Truy vấn** (chỉ đọc, đã bảo vệ bản sao): `getOrder(id)` (không thấy → `OrderNotFoundError`), `getOrdersByCustomer(customerId)`, `getLowStockProducts(threshold)`.

✅ **Test Phase 7** (`OrderService.lifecycle.test.ts`): toàn bộ chuỗi `place → ship → deliver → refund`; `ship` khi `ShippingApi` lỗi → đơn vẫn `PAID` và không có `trackingCode`; `cancel` ở PENDING và ở PAID kiểm tra tồn kho/ví/`reservedStock` về đúng; `cancel` khi đã `SHIPPED` → `InvalidOrderTransitionError` không đổi gì; `refund` ở ngày thứ 7 (được) và ngày thứ 8 (`RefundWindowExpiredError`) dùng `FakeClock.advanceDays`; hoàn tiền thẻ lỗi → trạng thái đơn và tồn kho không đổi.

---

## 📌 PHASE 8 — Async nâng cao: timeout, retry, idempotency, đồng thời

> **Mục tiêu**: Làm hệ thống chịu được môi trường thật: mạng chậm, lỗi tạm thời, người dùng bấm 2 lần, hai người mua cùng lúc.

### 🎯 Các bước thực hiện:

1. **`utils/resilience.ts`**:

   ```ts
   export function withTimeout<T>(
     promise: Promise<T>,
     ms: number,
     onTimeout: () => Error,
   ): Promise<T>;
   export interface RetryOptions {
     retries: number; // số lần thử lại (không tính lần đầu)
     baseDelayMs: number;
     factor: number; // backoff: delay = baseDelayMs * factor^(lầnThử-1)
     shouldRetry: (error: unknown) => boolean;
     sleep: (ms: number) => Promise<void>; // tiêm vào để test không chờ thật
   }
   export function withRetry<T>(
     fn: (attempt: number) => Promise<T>,
     opts: RetryOptions,
   ): Promise<T>;
   ```

   - `withTimeout`: dùng `setTimeout`, **luôn `clearTimeout`** khi promise gốc xong sớm (không để rò timer).
   - `withRetry`: chỉ thử lại khi `shouldRetry(error) === true`; hết số lần thì ném lỗi cuối cùng.

2. **Áp dụng vào bước M3 của `placeOrder`**: gọi `charge` bọc `withRetry(() => withTimeout(charge(...), 3000, () => new PaymentTimeoutError(3000)), { retries: 2, baseDelayMs: 200, factor: 2, shouldRetry: lỗi là PaymentFailedError có retryable === true HOẶC là PaymentTimeoutError, sleep })`. `sleep` và các hằng số này đưa vào `config` để test ghi đè.
3. **Timeout không có nghĩa là thất bại** (bài học quan trọng): khi gặp `PaymentTimeoutError` sau khi hết lượt retry, **không rollback ngay**. Trước tiên gọi `gateway.getChargeStatus(order.id)`:
   - `SUCCESS` → coi như đã thanh toán, lấy paymentId, đi tiếp M4 (tuyệt đối không trừ tiền lần nữa; nhờ `idempotencyKey = order.id`).
   - `FAILED` → rollback bình thường.
   - `UNKNOWN` → đơn chuyển `FAILED` với `failureReason = "Không xác định được trạng thái thanh toán — cần đối soát thủ công"`, rollback hàng hóa nhưng **ghi cảnh báo** (event ở Phase 9).
     Để làm được việc này, thêm `queryStatus(idempotencyKey)` vào interface `PaymentMethod` (ví: luôn trả `UNKNOWN` nếu chưa có giao dịch, hoặc `SUCCESS` nếu đã ghi nhận).
4. **Idempotency theo `requestId`** (thêm bước V0 ngay đầu khối VALIDATE của `placeOrder`):
   - Tìm đơn đã có cùng `requestId`. Nếu có và **nội dung yêu cầu giống hệt** (cùng customer, cùng items đã gộp, cùng paymentMethod, cùng discountCode) → **trả luôn đơn cũ, không làm gì thêm** (không reserve, không charge).
   - Nếu có cùng `requestId` nhưng nội dung khác → throw `IdempotencyConflictError`.
   - Lưu "dấu vân tay" nội dung yêu cầu cùng với đơn (thêm field `requestFingerprint: string` vào `Order`).
   - Trường hợp **hai lời gọi cùng `requestId` đang chạy song song**: giữ `Map<string, Promise<Order>>` các yêu cầu đang xử lý; lời gọi thứ hai `await` đúng promise của lời gọi thứ nhất; xóa khỏi map khi xong (cả thành công lẫn lỗi, dùng `finally`).
5. **Đồng thời (Concurrency)**: JavaScript đơn luồng nhưng vẫn có thể xen kẽ ở mỗi `await`. Vì vậy M1 (reserve) phải kiểm tra lại tồn kho thật sự ngay lúc reserve (đã có trong `product.reserve`) và **không được có `await` giữa lúc VALIDATE V4 và M1**. Viết test chứng minh: còn đúng 1 sản phẩm, hai khách gọi `Promise.all([placeOrder(A), placeOrder(B)])` → đúng một đơn `PAID`, một lời gọi bị `OutOfStockError`, tồn kho cuối cùng không âm, `reservedStock = 0`.

✅ **Test Phase 8** (`Resilience.test.ts`, `OrderService.concurrency.test.ts`): `withRetry` thử đúng số lần và đúng chuỗi độ trễ (kiểm tra mảng độ trễ được gọi vào `sleep`); lỗi `retryable: false` không retry; `withTimeout` bằng `vi.useFakeTimers()` (timer được dọn sạch, `vi.getTimerCount() === 0`); gateway lỗi 2 lần rồi thành công → `placeOrder` thành công và gateway tổng tiền đúng 1 lần; gateway `completeButHang` → sau timeout, `getChargeStatus` = SUCCESS → đơn `PAID`, không trừ tiền lần hai; gọi `placeOrder` 2 lần cùng `requestId` (tuần tự và song song) → chỉ 1 đơn, 1 lần trừ tiền; cùng `requestId` khác nội dung → `IdempotencyConflictError`; test đua nhau mua mặt hàng cuối.

---

## 📌 PHASE 9 — Typed Event-Driven & Listeners

> **Mục tiêu**: Các phần của hệ thống phản ứng với sự kiện mà không gọi trực tiếp nhau, và **kiểu dữ liệu của từng event được kiểm tra khi biên dịch**.

### 🎯 Các bước thực hiện:

1. **`events/TypedEventEmitter.ts`**:

   ```ts
   export class TypedEventEmitter<TEvents extends Record<string, unknown>> {
     on<K extends keyof TEvents>(
       event: K,
       handler: (data: TEvents[K]) => void,
     ): () => void; // trả hàm hủy đăng ký
     once<K extends keyof TEvents>(
       event: K,
       handler: (data: TEvents[K]) => void,
     ): () => void;
     off<K extends keyof TEvents>(
       event: K,
       handler: (data: TEvents[K]) => void,
     ): void;
     emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
     listenerCount<K extends keyof TEvents>(event: K): number;
   }
   ```

   - Bên trong dùng `Map<keyof TEvents, Set<handler>>` (không dùng `Function`/`any`).
   - Constructor nhận `onListenerError?: (event: keyof TEvents, error: unknown) => void`. **Một listener ném lỗi không được làm hỏng các listener khác và không được làm hỏng luồng nghiệp vụ** — `emit` bọc từng handler trong `try/catch` và gọi `onListenerError`.
   - Duyệt trên **bản sao** danh sách handler khi `emit` (để handler tự `off` trong lúc chạy không làm hỏng vòng lặp).

2. **`events/OrderEvents.ts`** — bảng kiểu:
   ```ts
   export interface OrderEvents {
     ORDER_PLACED: { orderId: string; customerId: string; total: number };
     ORDER_PAID: { orderId: string; paymentId: string };
     PAYMENT_FAILED: { orderId: string; reason: string; retryable: boolean };
     ORDER_SHIPPED: { orderId: string; trackingCode: string };
     ORDER_DELIVERED: { orderId: string };
     ORDER_CANCELLED: { orderId: string; refunded: boolean };
     ORDER_REFUNDED: { orderId: string; amount: number };
     LOW_STOCK: { productId: string; available: number };
     ROLLBACK_INCOMPLETE: { orderId: string; failedSteps: string[] };
     PAYMENT_STATUS_UNKNOWN: { orderId: string };
   }
   ```
3. **Tích hợp vào `OrderService`**: thêm `events: TypedEventEmitter<OrderEvents>` vào `OrderServiceDeps`. **Chỉ emit sau khi mọi thay đổi dữ liệu của bước đó đã thành công** (không emit "đã thanh toán" rồi mới rollback). Emit `LOW_STOCK` khi `getAvailable()` của một sản phẩm sau khi bán xuống `<= 5`. Thay `console.error` ở Phase 6 bằng event `ROLLBACK_INCOMPLETE`.
4. **`events/listeners/`** — mỗi listener là class riêng, nhận dependency qua constructor và có method `attach(events)`:
   - `NotificationListener(emailSender: EmailSender)`: với `EmailSender` là interface `{ send(to: string, subject: string, body: string): Promise<void> }`; gửi mail khi `ORDER_PAID`, `ORDER_SHIPPED`, `ORDER_CANCELLED`, `ORDER_REFUNDED` (cần lấy email khách từ `customerRepo`). Gửi mail lỗi không được ảnh hưởng đến ai.
   - `StatsListener`: đếm đơn theo trạng thái, cộng dồn doanh thu từ `ORDER_PAID`, trừ khi `ORDER_REFUNDED`/`ORDER_CANCELLED` (đã hoàn tiền); method `getReport()`.
   - `AuditLogListener(logger: { info(msg: string): void })`: ghi mọi event kèm thời gian từ `Clock`.

✅ **Test Phase 9** (`TypedEventEmitter.test.ts` + test listener): `on` rồi `emit` → gọi đúng 1 lần đúng data; `once` chỉ 1 lần; hàm hủy từ `on()` hoạt động; `off` đúng handler; handler tự `off` trong lúc emit; handler ném lỗi không chặn handler sau và `onListenerError` được gọi; `listenerCount`; kiểm tra bằng `// @ts-expect-error` rằng emit sai kiểu data hoặc sai tên event sẽ **không biên dịch được**; `NotificationListener` với `EmailSender` lỗi không làm `placeOrder` thất bại; `StatsListener` doanh thu đúng sau chuỗi place/cancel/refund; thứ tự event của một đơn thành công và một đơn lỗi (đơn lỗi **không** phát `ORDER_PAID`).

---

## 📌 PHASE 10 — Test tích hợp, kịch bản demo, tài liệu

> **Mục tiêu**: Chứng minh toàn hệ thống đúng ở mức tổng thể và đưa dự án về trạng thái "có thể giới thiệu cho người khác".

### 🎯 Các bước thực hiện:

1. **`test/helpers/snapshot.ts`**: hàm `snapshot(deps)` trả một object đã "đóng băng" (copy sâu) của toàn bộ `productRepo.findAll()`, `customerRepo.findAll()` (kèm số dư), `orderRepo.findAll()`, tổng tiền của `FakePaymentGateway`. Dùng để khẳng định `expect(after).toEqual(before)` ở mọi test lỗi (Luật cứng số 8). `test/helpers/fixtures.ts`: hàm dựng nhanh service với toàn bộ dependency giả (`FakeClock`, `SequentialIdGenerator`, sleep tức thời…).
2. **`Integration.test.ts`** (không mock service, chỉ mock hạ tầng ngoài):
   - Vòng đời đầy đủ: `place → ship → deliver → refund`, kiểm tra tồn kho, ví, đơn, event theo thứ tự, thống kê doanh thu.
   - Chuỗi lỗi trộn: đơn 1 thành công; đơn 2 lỗi thanh toán (rollback sạch); đơn 3 thành công sau khi gateway hồi phục; kiểm tra tổng tồn kho + hàng đã bán luôn khớp tổng ban đầu (**bất biến bảo toàn hàng**) và tiền: tổng tiền khách đã trả = tổng tiền gateway thu được − tiền đã hoàn.
   - Test **bất biến** sau chuỗi ngẫu nhiên các thao tác: `stock >= 0`, `reservedStock >= 0`, `reservedStock <= stock`, số dư ví `>= 0`.
3. **`src/main.ts`** — chạy tuần tự và in kết quả rõ ràng (có tiêu đề từng kịch bản, in tồn kho/số dư trước và sau):
   1. Đơn ví thành công kèm mã giảm giá.
   2. Đơn thẻ: gateway lỗi 2 lần rồi thành công (in ra các lần retry).
   3. Đơn thẻ thất bại hẳn → rollback (in tồn kho trước/sau để thấy trở về như cũ).
   4. Đơn hết hàng.
   5. Hủy đơn đã thanh toán (hoàn tiền + trả hàng về kho).
   6. Ship → deliver → refund.
   7. Gọi lại cùng `requestId` hai lần (chỉ một đơn được tạo).
   8. In báo cáo từ `StatsListener`.
4. **`README.md`**: điền đủ 5 đề mục; thêm sơ đồ lớp (Mermaid hoặc ASCII), bảng chuyển trạng thái của Order, ví dụ chạy `npm start`, và mục "Bài học" ghi 5 điều bạn rút ra.
5. **Dọn dẹp**: `npm run typecheck` sạch; tìm toàn dự án không còn `any`, `Function`, `console.log` rải rác trong `src/` (chỉ `main.ts` được in); `.gitignore` đầy đủ.

✅ **Nghiệm thu Phase 10**: `npm test` toàn bộ xanh và tổng thời gian chạy dưới vài giây; `npm start` chạy hết 8 kịch bản không lỗi.

---

## 📌 PHASE 11 (nâng cao) — Backend thật: REST API + Database + Transaction

> **Mục tiêu**: Chứng minh thiết kế đúng — đổi nơi lưu trữ mà **không phải sửa `OrderService`** — và thay cơ chế hoàn tác giả bằng transaction thật.

### 🎯 Các bước thực hiện:

1. Cài `express`, `better-sqlite3` (đồng bộ nên khớp với `IRepository` hiện tại), `zod` (validate input), `supertest` (test API).
2. **`SqliteRepository<T extends Entity>`** (hoặc một repo cho mỗi bảng: `SqliteProductRepository`, `SqliteCustomerRepository`, `SqliteOrderRepository`) cùng `implements IRepository<T>`. Tạo schema bằng file `schema.sql` (bảng `products`, `customers`, `orders`, `order_items`), dùng khóa chính, khóa ngoại, `CHECK (stock >= 0)`, `CHECK (reserved_stock >= 0 AND reserved_stock <= stock)`, `UNIQUE (request_id)`.
3. **Chạy lại toàn bộ test của Phase 1** trên `SqliteRepository` (dùng DB `:memory:`): cùng một bộ test hợp đồng (contract test) phải xanh cho cả hai cài đặt. Viết bộ test dưới dạng hàm nhận một factory `() => IRepository<T>`.
4. **Transaction thật**: tạo `UnitOfWork` có `run<T>(work: () => Promise<T>): Promise<T>` dùng `db.transaction`; phần thay đổi dữ liệu nội bộ của `placeOrder` chạy trong transaction (phần gọi cổng thanh toán ngoài vẫn dùng bù trừ vì không thể rollback hệ thống bên ngoài). Ghi vào README một đoạn giải thích: _vì sao_ chỉ dữ liệu nội bộ rollback được bằng transaction còn tiền ở cổng ngoài thì không.
5. **REST API** (`src/api/`): `POST /orders` (body: PlaceOrderRequest, header `Idempotency-Key` ánh xạ sang `requestId`), `GET /orders/:id`, `POST /orders/:id/ship`, `/deliver`, `/cancel`, `/refund`, `GET /customers/:id/orders`, `GET /products/low-stock?threshold=`. Validate input bằng `zod`; ánh xạ lỗi: `*NotFoundError` → 404, `InvalidOrderTransitionError`/`IdempotencyConflictError` → 409, `OutOfStockError`/`InsufficientBalanceError`/`InvalidQuantityError`/`InvalidDiscountError`/`EmptyOrderError` → 422, `PaymentFailedError` → 402, `PaymentTimeoutError` → 504, còn lại 500 (không lộ chi tiết nội bộ).
6. **Test API** bằng `supertest`: mỗi mã trạng thái HTTP ở trên có ít nhất 1 test; gọi `POST /orders` hai lần cùng `Idempotency-Key` → chỉ một đơn.
7. _(Tùy chọn)_ Ghi chú bài học: nếu chuyển sang driver bất đồng bộ (ví dụ PostgreSQL), `IRepository` phải đổi sang trả `Promise` — đây là chi phí thật của việc chọn interface đồng bộ; ghi lại vào README.
8. _(Tùy chọn)_ Viết lại phần lõi (Phase 1 → 6) bằng Java để so sánh cách hai ngôn ngữ biểu đạt cùng một thiết kế.

---

## 🏁 Kết quả đầu ra sau khi hoàn thành dự án này:

1. **Generics + Interface thật sự**: một `IRepository<T>` với hai cài đặt (bộ nhớ, SQLite) chạy chung một bộ test hợp đồng.
2. **State Pattern mang dữ liệu đúng cách**: 7 trạng thái, 42 ô chuyển trạng thái đều có test, dữ liệu đi kèm lưu trên entity.
3. **Strategy Pattern**: giảm giá, phí ship, phương thức thanh toán hoán đổi được.
4. **Dependency Injection**: không có `new` dịch vụ ngoài bên trong service; toàn bộ test chạy nhanh, không chờ delay thật.
5. **Validate-trước-ghi-sau + Rollback**: mọi nhánh lỗi có test chứng minh dữ liệu trở về y như cũ.
6. **Async nâng cao**: timeout, retry có backoff, idempotency theo `requestId`, chống đua nhau mua hàng cuối cùng, xử lý "timeout nhưng thực ra đã trừ tiền".
7. **Typed Event-Driven**: sai kiểu event thì không biên dịch được; listener lỗi không làm hỏng luồng chính.
8. **Sản phẩm hoàn thiện**: `main.ts` demo 8 kịch bản, README đầy đủ, `.gitignore` sạch, `tsc` sạch không còn `any`.
9. **Nền tảng backend thật**: REST API + database + transaction, sẵn sàng bước sang Spring Boot / NestJS.

---

## ✅ Checklist tự đánh giá cuối cùng

- [ ] `npm test` xanh, tổng thời gian chạy ngắn; không test nào chờ delay thật.
- [ ] `npm run typecheck` sạch; không còn `any` / `Function` trong `src/`.
- [ ] Mọi hàm nghiệp vụ có hai khối `VALIDATE` / `MUTATE` rõ ràng.
- [ ] Mỗi lỗi nghiệp vụ là một class riêng; không còn `throw new Error(...)` chung.
- [ ] `InMemoryRepository` có `implements IRepository<T>`; `add` trùng id ném lỗi; `update` không đụng `id`/`createdAt`.
- [ ] Không còn `order.status = ...` ngoài thư mục `states/`.
- [ ] Mọi test lỗi đều có so sánh `snapshot` trước/sau.
- [ ] `npm start` chạy đủ 8 kịch bản; README đầy đủ; `.gitignore` sạch.
