import { DomainErrors } from "./DomainErrors";

/**
 * Lỗi phát sinh khi cố gắng thêm một Entity có ID đã tồn tại vào Repository.
 * Mục đích: Đảm bảo tính duy nhất của khóa chính (ID) trong hệ thống lưu trữ.
 */
export class DuplicateEntityError extends DomainErrors {
  public readonly id: string;
  constructor(id: string) {
    super(`${id} đã tồn tại.`);
    this.id = id;
  }
}
