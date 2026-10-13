import { DomainErrors } from "./DomainErrors";
export class InvalidNum extends DomainErrors {
  constructor() {
    super(`Sản phẩm yêu cầu phải là số nguyên dương`);
  }
}
