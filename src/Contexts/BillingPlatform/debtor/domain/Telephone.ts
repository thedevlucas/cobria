import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";
import { Debtor } from "./Debtor";

export class Telephone extends AggregateRoot {
  id!: number;
  from: number;
  to: number;
  id_debtor: number;
  createdAt?: Date;
  updatedAt?: Date;
  debtor!: Debtor;

  constructor(from: number, to: number, id_debtor: number) {
    super();
    this.from = from;
    this.to = to;
    this.id_debtor = id_debtor;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    from: number;
    to: number;
    id_debtor: number;
  }): Telephone {
    return new Telephone(params.from, params.to, params.id_debtor);
  }

  static fromPrimitives(plainData: {
    id: number;
    from: number;
    to: number;
    id_debtor: number;
  }) {
    return new Telephone(plainData.from, plainData.to, plainData.id_debtor);
  }

  toPrimitives() {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      id_debtor: this.id_debtor,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
