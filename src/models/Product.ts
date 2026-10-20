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
  /*
   Constructor chịu trách nhiệm kiểm tra các thuộc tính price xem có âm không , có phải số
  nguyên không trước khi khởi tạo.
    ReservedStock phải bằng 0 
    Stock phải lớn hơn bằng 0
  */
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
    if (!Number.isInteger(price)) {
      throw new InvalidNum(price);
    }
    if (stock < 0) {
      throw new InvalidQuantityError(id, stock);
    }
    if (!Number.isInteger(stock)) {
      throw new InvalidNum(stock);
    }
    if (reservedStock !== 0) {
      throw new InvalidQuantityError(id, reservedStock);
    }
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.reservedStock = reservedStock;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /*
  Vì stock là private nên cần hàm getStock
  */
  getStock(): number {
    return this.stock;
  }
  /*
  Vì reservedStock là private nên cần hàm getReservedStock
  */
  getReservedStock(): number {
    return this.reservedStock;
  }
  /*
  Hàm này check xem có bao nhiêu sản phẩm khả dụng để đặt mua 
  */
  getAvailable(): number {
    return this.stock - this.reservedStock;
  }
  /*
  Hàm này đóng vai trò đặt trước sản phẩm và check logic trước khi đặt
  Yêu cầu số lượng sản phẩm yêu cầu là số nguyên
  Là số dương
  */
  reserve(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum(quantity);
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    if (quantity > this.getAvailable()) {
      throw new OutOfStockError(this.id, quantity, this.getAvailable());
    }
    this.reservedStock += quantity;
  }
  /*
  Hàm này dùng để giải phóng các sản phẩm đã được thêm vào ở reserve nhưng ko thỏa điều kiện để
  được giữ lại trong kho đặt trước vì các lí do khác
  Yêu cầu số lượng sản phẩm phải lớn hơn 0
  Phải là số nguyên
  */
  release(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum(quantity);
    }
    if (quantity > this.reservedStock) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    this.reservedStock -= quantity;
  }
  /*
  Hàm này chịu trách nhiệm trừ kho khi đã thanh toán
  Yêu cầu số lượng phải nguyên
  Phải lớn hơn 0 
  Phải bé hơn số sản phẩm đang nằm trong kho tạm
  */
  commit(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum(quantity);
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
  /* Hàm này chịu trách nhiệm hoàn hàng lại kho
   */
  restock(quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new InvalidNum(quantity);
    }
    if (quantity <= 0) {
      throw new InvalidQuantityError(this.id, quantity);
    }
    this.stock += quantity;
  }
}
