import { InsufficientBalanceError } from "../errors/InsufficientBalanceError";
import { InvalidBalance } from "../errors/InvalidBalance";
import { InvalidNum } from "../errors/InvalidNum";
import { Entity } from "./Entity";

export class Customer implements Entity {
  public readonly id: string;
  public email: string;
  public name: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  private walletBalance: number;
  /*
  Validate đối tượng trước khi tạo bằng cách check logic
  Check số dư ví cho đúng logic ngoài đời
  */
  constructor(
    id: string,
    email: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    walletBalance: number,
  ) {
    if (walletBalance < 0) {
      throw new InvalidBalance();
    }
    if (!Number.isInteger(walletBalance)) {
      throw new InvalidNum(walletBalance);
    }
    ((this.id = id),
      (this.email = email),
      (this.name = name),
      (this.createdAt = createdAt),
      (this.updatedAt = updatedAt),
      (this.walletBalance = walletBalance));
  }
  // Hàm này trả về số dư ví
  getBalance(): number {
    return this.walletBalance;
  }
  // Hàm này check xem có thể thanh toán không
  canAfford(amount: number): boolean {
    if (amount <= this.walletBalance && amount > 0 && Number.isInteger(amount))
      return true;
    else return false;
  }
  // Hàm này làm nhiệm vụ trừ tiền trong ví
  debit(amount: number): number {
    if (!Number.isInteger(amount)) {
      throw new InvalidNum(amount);
    }
    if (amount <= 0) {
      throw new InvalidNum(amount);
    }
    if (!this.canAfford(amount)) {
      throw new InsufficientBalanceError(this.id, amount, this.getBalance());
    }
    this.walletBalance = this.getBalance() - amount;
    return this.walletBalance;
  }
  // Hàm này làm nhiệm vụ cộng tiền trong ví
  credit(amount: number): number {
    if (!Number.isInteger(amount)) {
      throw new InvalidNum(amount);
    }
    if (amount <= 0) throw new InvalidNum(amount);
    this.walletBalance = this.getBalance() + amount;
    return this.walletBalance;
  }
}
