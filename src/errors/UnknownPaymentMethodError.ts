import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi khách hàng yêu cầu phương thức thanh toán không được hệ thống hỗ trợ hoặc chưa đăng ký.
 * Mục đích: Thẩm định phương thức thanh toán ở bước kiểm tra đầu vào (validate trước - ghi sau).
 */
export class UnknownPaymentMethodError extends DomainErrors {
  public readonly methodName: string;
  constructor(methodName: string) {
    super(`Không tìm thấy phương thức thanh toán : ${methodName}`);
    this.methodName = methodName;
  }
}
