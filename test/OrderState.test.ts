import { describe, it, expect, beforeEach } from "vitest";
import { OrderStatus } from "../src/enums/OrderStatus";
import { Order } from "../src/models/Order";
import { OrderItem } from "../src/models/OrderItem";
import { OrderStateFactory } from "../src/states/OrderStateFactory";
import { PendingState } from "../src/states/PendingState";
import { PaidState } from "../src/states/PaidState";
import { ShippedState } from "../src/states/ShippedState";
import { DeliveredState } from "../src/states/DeliveredState";
import { CancelledState } from "../src/states/CancelledState";
import { RefundedState } from "../src/states/RefundedState";
import { FailedState } from "../src/states/FailedState";
import { InvalidOrderTransitionError } from "../src/errors/InvalidOrderTransitionError";
import { InvalidOrderStatusError } from "../src/errors/InvalidOrderStatusError";

describe("Phase 3: OrderState & OrderStateFactory Tests", () => {
  const fixedDate = new Date("2026-03-01T08:00:00.000Z");
  const eventDate = new Date("2026-03-02T10:00:00.000Z");

  const createSampleOrder = (status: OrderStatus = OrderStatus.PENDING): Order => {
    return new Order({
      id: "ord-test-001",
      requestId: "req-001",
      customerId: "cust-001",
      items: [new OrderItem("prod-1", 2, 100000)],
      subtotal: 200000,
      discountCode: null,
      discountAmount: 0,
      shippingFee: 30000,
      total: 230000,
      paymentMethodName: "WALLET",
      status,
      paymentId: null,
      trackingCode: null,
      paidAt: null,
      deliveredAt: null,
      failureReason: null,
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });
  };

  describe("1. OrderStateFactory Tests", () => {
    it.each([
      [OrderStatus.PENDING, PendingState],
      [OrderStatus.PAID, PaidState],
      [OrderStatus.SHIPPED, ShippedState],
      [OrderStatus.DELIVERED, DeliveredState],
      [OrderStatus.CANCELLED, CancelledState],
      [OrderStatus.REFUNDED, RefundedState],
      [OrderStatus.FAILED, FailedState],
    ])("Trả về đúng State instance cho status %s", (status, expectedStateClass) => {
      const state = OrderStateFactory.getState(status);
      expect(state).toBeInstanceOf(expectedStateClass);
    });

    it("Ném lỗi InvalidOrderStatusError khi status không hợp lệ", () => {
      expect(() => {
        OrderStateFactory.getState("INVALID_STATUS" as unknown as OrderStatus);
      }).toThrow(InvalidOrderStatusError);
    });
  });

  describe("2. OrderState Valid Transitions (7 kịch bản hợp lệ)", () => {
    it("Case 01: PENDING -> pay() chuyển sang PAID và lưu paymentId, paidAt", () => {
      const order = createSampleOrder(OrderStatus.PENDING);
      const state = OrderStateFactory.getState(order.status);

      state.pay(order, "pay-test-999", eventDate);

      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentId).toBe("pay-test-999");
      expect(order.paidAt).toBe(eventDate);
    });

    it("Case 02: PENDING -> cancel() chuyển sang CANCELLED", () => {
      const order = createSampleOrder(OrderStatus.PENDING);
      const state = OrderStateFactory.getState(order.status);

      state.cancel(order);

      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    it("Case 03: PENDING -> fail() chuyển sang FAILED và lưu failureReason", () => {
      const order = createSampleOrder(OrderStatus.PENDING);
      const state = OrderStateFactory.getState(order.status);

      state.fail(order, "Kho không đủ số lượng giữ chỗ");

      expect(order.status).toBe(OrderStatus.FAILED);
      expect(order.failureReason).toBe("Kho không đủ số lượng giữ chỗ");
    });

    it("Case 04: PAID -> ship() chuyển sang SHIPPED và lưu trackingCode", () => {
      const order = createSampleOrder(OrderStatus.PAID);
      const state = OrderStateFactory.getState(order.status);

      state.ship(order, "VNPOST-TRACK-12345");

      expect(order.status).toBe(OrderStatus.SHIPPED);
      expect(order.trackingCode).toBe("VNPOST-TRACK-12345");
    });

    it("Case 05: PAID -> cancel() chuyển sang CANCELLED", () => {
      const order = createSampleOrder(OrderStatus.PAID);
      const state = OrderStateFactory.getState(order.status);

      state.cancel(order);

      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    it("Case 06: SHIPPED -> deliver() chuyển sang DELIVERED và lưu deliveredAt", () => {
      const order = createSampleOrder(OrderStatus.SHIPPED);
      const state = OrderStateFactory.getState(order.status);

      state.deliver(order, eventDate);

      expect(order.status).toBe(OrderStatus.DELIVERED);
      expect(order.deliveredAt).toBe(eventDate);
    });

    it("Case 07: DELIVERED -> refund() chuyển sang REFUNDED", () => {
      const order = createSampleOrder(OrderStatus.DELIVERED);
      const state = OrderStateFactory.getState(order.status);

      state.refund(order);

      expect(order.status).toBe(OrderStatus.REFUNDED);
    });
  });

  describe("3. OrderState Invalid Transitions (35 kịch bản bị cấm & bảo toàn dữ liệu)", () => {
    type ActionName = "pay" | "ship" | "deliver" | "cancel" | "refund" | "fail";

    const allStatuses = [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
      OrderStatus.REFUNDED,
      OrderStatus.FAILED,
    ] as const;

    const allActions: ActionName[] = ["pay", "ship", "deliver", "cancel", "refund", "fail"];

    const validTransitionPairs: Record<OrderStatus, ActionName[]> = {
      [OrderStatus.PENDING]: ["pay", "cancel", "fail"],
      [OrderStatus.PAID]: ["ship", "cancel"],
      [OrderStatus.SHIPPED]: ["deliver"],
      [OrderStatus.DELIVERED]: ["refund"],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: [],
    };

    const invalidCases: [OrderStatus, ActionName][] = [];

    for (const status of allStatuses) {
      for (const action of allActions) {
        if (!validTransitionPairs[status].includes(action)) {
          invalidCases.push([status, action]);
        }
      }
    }

    // Đảm bảo chính xác 35 trường hợp bị cấm (42 tổng - 7 hợp lệ = 35)
    expect(invalidCases.length).toBe(35);

    const executeAction = (action: ActionName, order: Order) => {
      const state = OrderStateFactory.getState(order.status);
      switch (action) {
        case "pay":
          state.pay(order, "pay-fake", eventDate);
          break;
        case "ship":
          state.ship(order, "tracking-fake");
          break;
        case "deliver":
          state.deliver(order, eventDate);
          break;
        case "cancel":
          state.cancel(order);
          break;
        case "refund":
          state.refund(order);
          break;
        case "fail":
          state.fail(order, "lý do fake");
          break;
      }
    };

    it.each(invalidCases)(
      "Khi đơn đang ở [%s], gọi hành động '%s' phải ném InvalidOrderTransitionError và giữ nguyên order",
      (status, action) => {
        const order = createSampleOrder(status);

        // Snapshot trạng thái ban đầu để kiểm tra bảo toàn dữ liệu (Luật cứng 2 & 8)
        const initialStatus = order.status;
        const initialPaymentId = order.paymentId;
        const initialTrackingCode = order.trackingCode;
        const initialPaidAt = order.paidAt;
        const initialDeliveredAt = order.deliveredAt;
        const initialFailureReason = order.failureReason;

        expect(() => executeAction(action, order)).toThrow(InvalidOrderTransitionError);

        try {
          executeAction(action, order);
        } catch (error) {
          expect(error).toBeInstanceOf(InvalidOrderTransitionError);
          const transitionError = error as InvalidOrderTransitionError;
          expect(transitionError.orderId).toBe(order.id);
          expect(transitionError.from).toBe(status);
        }

        // Kiểm tra toàn vẹn dữ liệu: Không một trường nào bị ghi đè khi thao tác thất bại
        expect(order.status).toBe(initialStatus);
        expect(order.paymentId).toBe(initialPaymentId);
        expect(order.trackingCode).toBe(initialTrackingCode);
        expect(order.paidAt).toBe(initialPaidAt);
        expect(order.deliveredAt).toBe(initialDeliveredAt);
        expect(order.failureReason).toBe(initialFailureReason);
      }
    );
  });
});
