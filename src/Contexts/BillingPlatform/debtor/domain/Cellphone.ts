import { Debtor } from "./Debtor";

export class Cellphone {
  id?: number;
  from: number;
  to: number;
  id_debtor: number;
  readonly createdAt: Date;
  updatedAt: Date;
  debtor?: Debtor;

  constructor(from: number, to: number, id_debtor: number) {
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
  }): Cellphone {
    return new Cellphone(params.from, params.to, params.id_debtor);
  }

  static fromPrimitives(plainData: {
    from: number;
    to: number;
    id_debtor: number;
  }): Cellphone {
    return new Cellphone(plainData.from, plainData.to, plainData.id_debtor);
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
