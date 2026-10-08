export abstract class DomainErrors extends Error {
  /* Vì ở đây đang theo cấu trúc phân tầng 
     Error
       |
    Domain Error
       |
    Lỗi ở lớp con
    */
  // Ở dòng Object.setPrototypeOf(this, new.target.prototype) có lưu ý là
  // This ở đây là thực thể được sinh khi new 1 class lỗi mới, ví dụ nếu là lỗi OutOfBound thì
  // this ở đây là OutOfBound
  // Vì trong  Object.setPrototypeOf yêu cầu tham số đầu vào phải là Prototype Object mà new.target
  // lại là Constructor Function nên phải dùng .prototype để lấy bản thiết kế của chính new.target đó

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}
