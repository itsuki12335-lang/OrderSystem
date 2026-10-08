import { IdGenerator } from "./IdGenerator";
export class SequentialIdGenerator implements IdGenerator {
  private num: number = 0;
  // Hàm này trả về Id tuần tự
  next(prefix: string): string {
    this.num += 1;
    return `${prefix}-${this.num}`;
  }
}
