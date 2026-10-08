import { Clock } from "./Clock";
export class FakeClock implements Clock {
  private currentDate: Date;
  constructor(currentDate: Date = new Date()) {
    this.currentDate = new Date(currentDate);
  }
  // Hàm này trả về thời gian theo currentDate , kiểu Date
  now(): Date {
    return new Date(this.currentDate);
  }
  // Hàm này dùng để tua tới n ngày sau
  advanceDays(n: number) {
    this.currentDate = new Date(
      this.currentDate.getTime() + n * 24 * 1000 * 60 * 60,
    );
  }
  // Hàm này dùng để tua tới mili-second giây sau
  advanceMs(ms: number) {
    this.currentDate = new Date(this.currentDate.getTime() + ms);
  }
  // Hàm này dùng để set thời gian theo ý muốn
  set(date: Date) {
    this.currentDate = new Date(date);
  }
}
