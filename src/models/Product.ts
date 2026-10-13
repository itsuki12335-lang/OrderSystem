import { InvalidNum } from "../errors/InvalidNum";
import { InvalidQuantityError } from "../errors/InvalidQuantityError";
import { OutOfStockError } from "../errors/OutOfStockError";
import { Entity } from "./Entity";

export class Product implements Entity {
  public readonly id: string;
  public readonly name: string;
  public readonly price: number;
  private stock: number; // Số lượng sản phẩm trong kho
  private reservedStock: number; // Số lượng sản phẩm đã đặt trước
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: string,
    name: string,
    price: number,
    stock: number,
    reservedStock: number,
    createdAt: Date,
    updatedAt: Date = createdAt,
  ) {
    if (price < 0) {
      throw new InvalidQuantityError(id, price);
    }
    if (Number.isInteger(price)) {
      throw new InvalidNum();
    }
    if (stock < 0) {
      throw new InvalidQuantityError(id, stock);
    }
    if (Number.isInteger(stock)) {
      throw new InvalidNum();
    }
    if (reservedStock !== 0) {
      throw new InvalidQuantityError(id, reservedStock);
    }
    ((this.id = id),
      (this.name = name),
      (this.price = price),
      (this.stock = stock),
      (this.reservedStock = reservedStock),
      (this.createdAt = createdAt),
      (this.updatedAt = updatedAt));
  }
  checkIsNumber(num: number): boolean {
    if (Number.isInteger(num)) {
      return true;
    }
    return false;
  }
  getStock(): number {
    return this.stock;
  }
  getReservedStock(): number {
    return this.reservedStock;
  }
  getAvailable(): number {
    return this.stock - this.reservedStock;
  }
  reserve(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum();
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    if (quantity > this.getAvailable()) {
      throw new OutOfStockError(this.id, quantity, this.getAvailable());
    }
    this.reservedStock += quantity;
  }

  release(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum();
    }
    if (quantity > this.reservedStock) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    this.reservedStock -= quantity;
  }
  commit(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum();
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    if (quantity > this.reservedStock) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    this.stock -= quantity;
    this.reservedStock -= quantity;
  }
  restock(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum();
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    this.stock += quantity;
  }
}
