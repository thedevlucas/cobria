export enum DebtImageType {
  ADDED = "Added",
  PAID = "Paid",
  PENDING = "Pending",
}

export class DebtImage {
  id!: number;
  id_debtor: number;
  image: string;
  type: DebtImageType;

  constructor(id_debtor: number, image: string, type: DebtImageType) {
    this.id_debtor = id_debtor;
    this.image = image;
    this.type = type;
  }

  static create(params: {
    id_debtor: number;
    image: string;
    type: DebtImageType;
  }): DebtImage {
    return new DebtImage(params.id_debtor, params.image, params.type);
  }

  static fromPrimitives(plainData: {
    id: number;
    id_debtor: number;
    image: string;
    type: DebtImageType;
  }) {
    return new DebtImage(plainData.id_debtor, plainData.image, plainData.type);
  }

  toPrimitives() {
    return {
      id: this.id,
      id_debtor: this.id_debtor,
      image: this.image,
      type: this.type,
    };
  }
}
