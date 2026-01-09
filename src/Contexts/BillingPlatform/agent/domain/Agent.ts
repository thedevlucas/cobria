export class Agent {
  id!: number;
  name: string;
  phone: string;
  idCompany: number;
  monthsToExpire: number;
  expireAt: Date;
  price: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    idCompany: number,
    name: string,
    phone: string,
    monthsToExpire: number,
    price: number,
    expireAt: Date
  ) {
    this.idCompany = idCompany;
    this.name = name;
    this.phone = phone;
    this.monthsToExpire = monthsToExpire;
    this.price = price;
    this.expireAt = expireAt;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    idCompany: number;
    name: string;
    phone: string;
    monthsToExpire: number;
    price: number;
  }): Agent {
    const calculatedExpireDate = new Date();
    calculatedExpireDate.setMonth(
      calculatedExpireDate.getMonth() + params.monthsToExpire
    );

    return new Agent(
      params.idCompany,
      params.name,
      params.phone,
      params.monthsToExpire,
      params.price,
      calculatedExpireDate
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      idCompany: this.idCompany,
      monthsToExpire: this.monthsToExpire,
      price: this.price,
      expireAt: this.expireAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
