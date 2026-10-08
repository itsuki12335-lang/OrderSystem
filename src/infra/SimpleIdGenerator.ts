import { Clock } from "./Clock";
import { IdGenerator } from "./IdGenerator";

export class SimpleIdGenerator implements IdGenerator {
  constructor(private readonly clock: Clock) {}
  // Hàm này sinh Id tự do 1 cách có quy luật :)
  next(prefix: string): string {
    const randomInt = Math.floor(Math.random() * 10000);
    return `${prefix}-${this.clock.now().getTime()}-${randomInt}`;
  }
}
