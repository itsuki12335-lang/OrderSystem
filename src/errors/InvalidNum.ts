import { DomainErrors } from "./DomainErrors";
export class InvalidNum extends DomainErrors {
  public readonly input: number;
  constructor(input: number) {
    super(`${input} không hợp lệ`);
    this.input = input;
  }
}
