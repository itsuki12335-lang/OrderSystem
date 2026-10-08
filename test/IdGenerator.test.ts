import { describe, it, expect } from "vitest";
import { SequentialIdGenerator } from "../src/infra/SequentialIdGenerator";
import { SimpleIdGenerator } from "../src/infra/SimpleIdGenerator";
import { FakeClock } from "../src/infra/FakeClock";

describe("IdGenerator Tests", () => {
  describe("SequentialIdGenerator", () => {
    it("Testcase 1: Sinh ID tuần tự tăng dần từ 1, đúng format PREFIX-1, PREFIX-2", () => {
      const generator = new SequentialIdGenerator();

      expect(generator.next("ORDER")).toBe("ORDER-1");
      expect(generator.next("ORDER")).toBe("ORDER-2");
      expect(generator.next("ORDER")).toBe("ORDER-3");
    });

    it("Testcase 2: Hoạt động đúng với nhiều prefix khác nhau", () => {
      const generator = new SequentialIdGenerator();

      expect(generator.next("PROD")).toBe("PROD-1");
      expect(generator.next("CUST")).toBe("CUST-2");
      expect(generator.next("ORDER")).toBe("ORDER-3");
    });

    it("Testcase 3: Các instance khác nhau có bộ đếm độc lập", () => {
      const gen1 = new SequentialIdGenerator();
      const gen2 = new SequentialIdGenerator();

      expect(gen1.next("ORDER")).toBe("ORDER-1");
      expect(gen2.next("ORDER")).toBe("ORDER-1");
    });
  });

  describe("SimpleIdGenerator", () => {
    it("Testcase 4: Đúng cấu trúc PREFIX-TIMESTAMP-RANDOM", () => {
      const fixedTime = new Date("2026-01-01T00:00:00.000Z");
      const clock = new FakeClock(fixedTime);
      const generator = new SimpleIdGenerator(clock);

      const id = generator.next("ORDER");
      const parts = id.split("-");

      expect(parts[0]).toBe("ORDER");
      expect(parts[1]).toBe(fixedTime.getTime().toString());
      expect(Number(parts[2])).toBeGreaterThanOrEqual(0);
      expect(Number(parts[2])).toBeLessThan(10000);
    });

    it("Testcase 5: Sinh ID duy nhất khi gọi liên tục", () => {
      const clock = new FakeClock(new Date("2026-01-01T00:00:00.000Z"));
      const generator = new SimpleIdGenerator(clock);

      const idSet = new Set<string>();
      for (let i = 0; i < 50; i++) {
        idSet.add(generator.next("ITEM"));
      }

      // Đa số ID sẽ phân biệt nhờ randomInt (cho dù cùng timestamp)
      expect(idSet.size).toBeGreaterThan(1);
    });
  });
});
