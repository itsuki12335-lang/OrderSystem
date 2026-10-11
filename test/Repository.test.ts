import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../src/repository/InMemoryRepository";
import { DuplicateEntityError } from "../src/errors/DuplicateEntityError";
import { FakeClock } from "../src/infra/FakeClock";
import { Entity } from "../src/models/Entity";

// Entity giả lập dùng cho việc kiểm thử Repository
class DummyItem {
  constructor(public title: string, public price: number) {}

  getTotal(qty: number): number {
    return this.price * qty;
  }
}

class DummyEntity implements Entity {
  constructor(
    public id: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
    public tags: string[] = [],
    public items: DummyItem[] = []
  ) {}

  greet(): string {
    return `Hello, ${this.name}`;
  }
}

describe("InMemoryRepository (Phase 1)", () => {
  let clock: FakeClock;
  let repo: InMemoryRepository<DummyEntity>;
  const baseDate = new Date("2026-01-01T00:00:00.000Z");

  beforeEach(() => {
    clock = new FakeClock(baseDate);
    repo = new InMemoryRepository<DummyEntity>(clock);
  });

  describe("add & findById", () => {
    it("Testcase 1: add rồi findById trả đúng dữ liệu", () => {
      const entity = new DummyEntity(
        "item-1",
        "Sản phẩm A",
        clock.now(),
        clock.now(),
        ["tag1", "tag2"],
        [new DummyItem("Sub 1", 100)]
      );

      repo.add(entity);
      const found = repo.findById("item-1");

      expect(found).not.toBeNull();
      expect(found?.id).toBe("item-1");
      expect(found?.name).toBe("Sản phẩm A");
      expect(found?.createdAt.toISOString()).toBe(baseDate.toISOString());
      expect(found?.greet()).toBe("Hello, Sản phẩm A");
      expect(found?.items[0]?.getTotal(2)).toBe(200);
    });

    it("Testcase 2: add trùng id → throw DuplicateEntityError và số lượng trong repo không đổi", () => {
      const entity1 = new DummyEntity("item-1", "A", clock.now(), clock.now());
      const entity2 = new DummyEntity("item-1", "B", clock.now(), clock.now());

      repo.add(entity1);

      expect(() => repo.add(entity2)).toThrow(DuplicateEntityError);

      try {
        repo.add(entity2);
      } catch (err) {
        expect(err).toBeInstanceOf(DuplicateEntityError);
        expect((err as DuplicateEntityError).id).toBe("item-1");
      }

      const all = repo.findAll();
      expect(all.length).toBe(1);
      expect(all[0]?.name).toBe("A");
    });
  });

  describe("Immutability & Deep Copy", () => {
    it("Testcase 3: Sửa object trả về từ findById không làm thay đổi dữ liệu trong repo", () => {
      const entity = new DummyEntity("item-1", "Gốc", clock.now(), clock.now());
      repo.add(entity);

      const retrieved = repo.findById("item-1");
      expect(retrieved).not.toBeNull();

      // Cố tình sửa thuộc tính và Date bên ngoài
      retrieved!.name = "Đã bị sửa";
      retrieved!.createdAt.setFullYear(2099);

      // Lấy lại từ repo để kiểm tra dữ liệu gốc
      const fresh = repo.findById("item-1");
      expect(fresh?.name).toBe("Gốc");
      expect(fresh?.createdAt.toISOString()).toBe(baseDate.toISOString());
    });

    it("Testcase 4: Sửa object truyền vào add sau khi add không ảnh hưởng dữ liệu trong repo", () => {
      const entity = new DummyEntity("item-1", "Gốc", clock.now(), clock.now());
      repo.add(entity);

      // Cố tình sửa sau khi add
      entity.name = "Đổi ngoài repo";
      entity.createdAt.setFullYear(2099);

      const fresh = repo.findById("item-1");
      expect(fresh?.name).toBe("Gốc");
      expect(fresh?.createdAt.toISOString()).toBe(baseDate.toISOString());
    });

    it("Testcase 5: Kiểm tra mảng bên trong entity được sao chép sâu", () => {
      const item1 = new DummyItem("Item 1", 50);
      const entity = new DummyEntity(
        "item-1",
        "Có mảng",
        clock.now(),
        clock.now(),
        ["alpha", "beta"],
        [item1]
      );

      repo.add(entity);

      // 1. Thử sửa mảng của entity truyền vào
      entity.tags.push("gamma");
      entity.items[0]!.title = "Đã đổi tên ngoài";

      const found1 = repo.findById("item-1");
      expect(found1?.tags).toEqual(["alpha", "beta"]);
      expect(found1?.items[0]?.title).toBe("Item 1");

      // 2. Thử sửa mảng lấy ra từ findById
      found1?.tags.push("omega");
      found1!.items[0]!.price = 9999;

      const found2 = repo.findById("item-1");
      expect(found2?.tags).toEqual(["alpha", "beta"]);
      expect(found2?.items[0]?.price).toBe(50);
      // Kiểm tra method của phần tử con trong mảng vẫn chạy tốt
      expect(found2?.items[0]?.getTotal(3)).toBe(150);
    });
  });

  describe("update", () => {
    it("Testcase 6: update chỉ đổi đúng field truyền vào và updatedAt đổi theo FakeClock", () => {
      const entity = new DummyEntity("item-1", "Cũ", clock.now(), clock.now());
      repo.add(entity);

      // Tua thời gian thêm 3 ngày
      clock.advanceDays(3);
      const updatedTime = clock.now();

      const success = repo.update("item-1", { name: "Mới" });
      expect(success).toBe(true);

      const updated = repo.findById("item-1");
      expect(updated?.name).toBe("Mới");
      expect(updated?.updatedAt.toISOString()).toBe(updatedTime.toISOString());
      expect(updated?.createdAt.toISOString()).toBe(baseDate.toISOString());
    });

    it("Testcase 7: Cố truyền id hoặc createdAt trong patch (ép kiểu bằng as) → hai field này không đổi", () => {
      const entity = new DummyEntity("item-1", "Tên A", clock.now(), clock.now());
      repo.add(entity);

      clock.advanceDays(1);

      // Cố tình ép kiểu truyền id và createdAt bẩn vào
      const maliciousPatch = {
        name: "Tên Đã Update",
        id: "HACKED-ID",
        createdAt: new Date("2099-12-31T00:00:00.000Z"),
      } as any;

      const success = repo.update("item-1", maliciousPatch);
      expect(success).toBe(true);

      const result = repo.findById("item-1");
      expect(result?.id).toBe("item-1"); // ID vẫn là item-1
      expect(result?.createdAt.toISOString()).toBe(baseDate.toISOString()); // createdAt không đổi
      expect(result?.name).toBe("Tên Đã Update"); // name được update
    });

    it("Testcase 8: update id không tồn tại → trả về false", () => {
      const success = repo.update("non-existent-id", { name: "Test" });
      expect(success).toBe(false);
    });
  });

  describe("delete", () => {
    it("Testcase 9: delete thành công → trả về true và findById sau đó trả về null", () => {
      const entity = new DummyEntity("item-1", "Test", clock.now(), clock.now());
      repo.add(entity);

      const success = repo.delete("item-1");
      expect(success).toBe(true);

      const found = repo.findById("item-1");
      expect(found).toBeNull();
      expect(repo.findAll().length).toBe(0);
    });

    it("Testcase 10: delete id không tồn tại → trả về false và không làm mất phần tử khác", () => {
      const entity = new DummyEntity("item-1", "Test", clock.now(), clock.now());
      repo.add(entity);

      const success = repo.delete("unknown-id");
      expect(success).toBe(false);

      // Đảm bảo không bị xóa nhầm phần tử cuối mảng
      expect(repo.findAll().length).toBe(1);
      expect(repo.findById("item-1")).not.toBeNull();
    });
  });

  describe("filter & findAll", () => {
    it("Testcase 11: filter trả về bản sao, sửa đổi kết quả không ảnh hưởng dữ liệu trong repo", () => {
      repo.add(new DummyEntity("item-1", "Apple", clock.now(), clock.now()));
      repo.add(new DummyEntity("item-2", "Banana", clock.now(), clock.now()));
      repo.add(new DummyEntity("item-3", "Avocado", clock.now(), clock.now()));

      const filtered = repo.filter((item) => item.name.startsWith("A"));
      expect(filtered.length).toBe(2);

      // Sửa kết quả trả về từ filter
      filtered[0]!.name = "Modified Apple";

      const checkFresh = repo.findById("item-1");
      expect(checkFresh?.name).toBe("Apple");
    });

    it("Testcase 12: findAll trả về toàn bộ bản sao, sửa kết quả không ảnh hưởng repo", () => {
      repo.add(new DummyEntity("item-1", "One", clock.now(), clock.now()));
      repo.add(new DummyEntity("item-2", "Two", clock.now(), clock.now()));

      const all = repo.findAll();
      expect(all.length).toBe(2);

      all[0]!.name = "Hacked One";

      expect(repo.findById("item-1")?.name).toBe("One");
    });
  });
});
