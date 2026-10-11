import { DuplicateEntityError } from "../errors/DuplicateEntityError";
import { Clock } from "../infra/Clock";
import { Entity } from "../models/Entity";
import { IRepository } from "./IRepository";
export class InMemoryRepository<T extends Entity> implements IRepository<T> {
  private readonly clock: Clock;
  private items: T[] = [];
  constructor(clock: Clock) {
    this.clock = clock;
  }
  /* Hàm này chuyển đối tượng từ kiểu object thành prototype . Tức là dùng được method nếu có
   */
  private getObj(item: any): unknown {
    const object = { ...item };
    const temp = Object.getPrototypeOf(item);
    return Object.setPrototypeOf(object, temp);
  }
  /* Hàm này hỗ trợ việc chuyển đối tượng từ kiểu object thành prototype với các phân nhóm dữ liệu
     khác nhau
  */
  private cloneElement(item: any): unknown {
    if (item instanceof Date) {
      return new Date(item);
    }
    if (typeof item === "object" && item !== null) {
      return this.getObj(item);
    }
    return item;
  }
  /*DeepCopy 1 đối tượng cụ thể kiểu Generics . Tránh tác nhân bên ngoài can thiệp vào được các
    đối tượng kiểu  Object để sửa đổi
  */
  private clone(item: T): T {
    /* Tạo 1 biến tên object và dùng Object.getPrototypeOf để lấy bản Prototype 
    nhằm lấy các method và dùng được nhưng các thuộc tính thì không có
    */
    // Tạo 1 biến object lưu trữ
    const object = Object.create(Object.getPrototypeOf(item));
    // Chạy For để lấy từng đối tượng ra và trả về cặp Key-Value . Object.entries trả về Key-Value
    for (const [key, value] of Object.entries(item)) {
      // Check xem giá trị có phải Date ko . Đúng thì new Date cho giá trị
      if (value instanceof Date) {
        let newDate = new Date(value);
        object[key] = newDate;
      } else if (Array.isArray(value)) {
        // Check xem có phải mảng ko . Nếu đúng thì gọi lên hàm cloneElement
        object[key] = value.map((element) => this.cloneElement(element));
      } else {
        object[key] = value;
      }
    }
    // Để máy chắc chắn rằng đối tượng trả về là 1 object kiểu T
    return object as T;
  }
  /* Thêm 1 đối tượng vào mảng . Check trước xem có tồn tại chưa . Nếu chưa thì add vào
   */
  add(item: T): void {
    for (const temp of this.items) {
      if (item.id === temp.id) {
        throw new DuplicateEntityError(item.id);
      }
    }
    this.items.push(this.clone(item));
  }
  // Tìm 1 đối tượng theo Id
  findById(id: string): T | null {
    for (const temp of this.items) {
      if (temp.id === id) {
        return this.clone(temp);
      }
    }
    return null;
  }
  // Tìm tất cả đối tượng
  findAll(): T[] {
    return this.items.map((element) => this.clone(element));
  }
  // Cập nhật 1 đối tượng theo id và update thuộc tính mới theo patch
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): boolean {
    const target = this.items.find((temp) => temp.id === id);
    if (target) {
      const { id: _id, createdAt: _createdAt, ...validUpdates } = patch as any;
      Object.assign(target, validUpdates);
      target.updatedAt = this.clock.now();
      return true;
    }
    return false;
  }
  // Xóa 1 đối tượng theo id
  delete(id: string): boolean {
    const target = this.items.findIndex((temp) => temp.id === id);
    if (target === -1) {
      return false;
    }
    this.items.splice(target, 1);
    return true;
  }
  // Lọc 1 đối tượng theo điều kiện
  filter(predicate: (item: T) => boolean): T[] {
    const fil: T[] = [];
    for (const temp of this.items) {
      const cloned = this.clone(temp);
      if (predicate(cloned)) {
        fil.push(cloned);
      }
    }
    return fil;
  }
}
