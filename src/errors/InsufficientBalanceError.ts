import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi số dư ví của khách hàng không đủ để thanh toán số tiền yêu cầu.
 * Mục đích: Đảm bảo khách hàng chỉ có thể thanh toán khi có đủ số dư khả dụng, tránh số dư bị âm.
 */
export class InsufficientBalanceError extends DomainErrors {
  public readonly customerId: string;
  public readonly required: number;
  public readonly available: number;
  constructor(customerId: string, required: number, available: number) {
    super(`Số dư của khách hàng ${customerId} không đủ . 
            Số dư khả dụng : ${available}.
            Số tiền thanh toán : ${required}`);
    this.customerId = customerId;
    this.required = required;
    this.available = available;
  }
}
