import { describe, it, expect } from "vitest";
import { FakeClock } from "../src/infra/FakeClock";
import { SystemClock } from "../src/infra/SystemClock";

describe("Clock Implementation Tests", () => {
  describe("SystemClock", () => {
    it("trả về Date hợp lệ và gần với thời điểm hiện tại", () => {
      const clock = new SystemClock();
      const before = Date.now();
      const now = clock.now().getTime();
      const after = Date.now();

      expect(now).toBeGreaterThanOrEqual(before);
      expect(now).toBeLessThanOrEqual(after);
    });
  });

  describe("FakeClock", () => {
    it("Testcase 1: Khởi tạo với mốc Date ban đầu chính xác", () => {
      const initial = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(initial);
      expect(clock.now().toISOString()).toBe("2026-01-01T00:00:00.000Z");
    });

    it("Testcase 2: Immutability - Sửa Date truyền vào constructor không làm đổi giờ trong FakeClock", () => {
      const initial = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(initial);

      // Cố tình sửa đối tượng Date bên ngoài
      initial.setFullYear(2099);

      expect(clock.now().toISOString()).toBe("2026-01-01T00:00:00.000Z");
    });

    it("Testcase 3: Immutability - Sửa Date nhận được từ now() không làm đổi giờ bên trong FakeClock", () => {
      const initial = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(initial);

      const retrieved = clock.now();
      retrieved.setFullYear(2099);

      expect(clock.now().toISOString()).toBe("2026-01-01T00:00:00.000Z");
    });

    it("Testcase 4: advanceDays tua thời gian chính xác", () => {
      const initial = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(initial);

      clock.advanceDays(3);
      expect(clock.now().toISOString()).toBe("2026-01-04T00:00:00.000Z");

      // Tua lùi
      clock.advanceDays(-1);
      expect(clock.now().toISOString()).toBe("2026-01-03T00:00:00.000Z");
    });

    it("Testcase 5: advanceMs tua mili-giây chính xác", () => {
      const initial = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(initial);

      clock.advanceMs(1500);
      expect(clock.now().getTime()).toBe(initial.getTime() + 1500);
    });

    it("Testcase 6: set đổi mốc thời gian và bảo vệ tính bất biến", () => {
      const initial = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(initial);

      const newDate = new Date("2026-12-25T12:00:00.000Z");
      clock.set(newDate);

      // Cố tình sửa đối tượng newDate bên ngoài
      newDate.setFullYear(3000);

      expect(clock.now().toISOString()).toBe("2026-12-25T12:00:00.000Z");
    });

    it("Testcase 7: Rule 7 - Chạy tức thì, không bị delay thực tế (> 50ms)", () => {
      const start = performance.now();
      const clock = new FakeClock(new Date("2026-01-01T00:00:00.000Z"));

      for (let i = 0; i < 1000; i++) {
        clock.advanceDays(1);
        clock.advanceMs(100);
        clock.now();
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });
});
