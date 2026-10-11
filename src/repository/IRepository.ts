import { Entity } from "../models/Entity";
/* Tạo ra 1 kiểu dữ liệu mới có tên là UpdatePatch có kiểu T kế thừa Entity
   Tức là nhận mọi đầu vào miễn nó kế thừa Entity và dùng Omit để kiểu T đó thành 1 dữ liệu mới giống T
   nhưng bỏ trường Id và CreateAt đi
   Tức là mọi đối tượng nào được gọi tới typeUpdate nếu có 2 trường này thì sẽ tự động loại bỏ
*/
export type UpdatePatch<T extends Entity> = Partial<
  Omit<T, "id" | "createdAt">
>;

export interface IRepository<T extends Entity> {
  add(item: T): void;
  findById(id: string): T | null;
  findAll(): T[];
  update(id: string, patch: UpdatePatch<T>): boolean;
  delete(id: string): boolean;
  filter(predicate: (item: T) => boolean): T[];
}
