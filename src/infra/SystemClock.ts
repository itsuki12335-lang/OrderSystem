import { Clock } from "./Clock";
export class SystemClock implements Clock {
  // Hàm này trả về thời gian hiện tại theo kiểu Date
  now(): Date {
    return new Date();
  }
}
