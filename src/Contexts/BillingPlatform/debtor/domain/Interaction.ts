import { Debtor } from "./Debtor";

export class Interaction {
  id!: number;
  idDebtor: number;
  text: string;
  createdAt: Date;
  debtor!: Debtor;

  constructor(idDebtor: number, text: string, createdAt: Date) {
    this.idDebtor = idDebtor;
    this.text = text;
    this.createdAt = createdAt;
  }

  static create(params: {
    idDebtor: number;
    text: string;
    createdAt: Date;
  }): Interaction {
    return new Interaction(params.idDebtor, params.text, params.createdAt);
  }

  static fromPrimitives(plainData: {
    id: number;
    idDebtor: number;
    text: string;
    createdAt: Date;
  }) {
    return new Interaction(
      plainData.idDebtor,
      plainData.text,
      plainData.createdAt
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      idDebtor: this.idDebtor,
      text: this.text,
      createdAt: this.createdAt,
    };
  }
}
