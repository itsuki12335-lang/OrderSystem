import { DomainErrors } from "./DomainErrors";

export class InvalidBalance extends DomainErrors {
  constructor() {
    super(`Số dư ban đầu không được âm`);
  }
}
