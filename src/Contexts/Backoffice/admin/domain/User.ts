import { Role } from "../../../BillingPlatform/company/domain/Company";
import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";

export class User extends AggregateRoot {
  id!: number;
  name: string;
  password: string;
  role: Role;
  email: string;
  active: boolean;
  cellphone?: number;
  telephone?: number;
  isCollectionCompany: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    name: string,
    password: string,
    role: Role,
    email: string,
    cellphone: number,
    telephone: number,
    isCollectionCompany?: boolean // Make isCollectionCompany optional
  ) {
    super();
    this.name = this.capitalizeName(name);
    this.password = password;
    this.role = role;
    this.email = email;
    this.active = true;
    this.cellphone = cellphone;
    this.telephone = telephone;
    this.isCollectionCompany = isCollectionCompany || false; // Set from parameter or default
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    name: string;
    password: string;
    role: Role;
    email: string;
    cellphone: number;
    telephone: number;
    isCollectionCompany?: boolean;
  }): User {
    return new User(
      params.name,
      params.password,
      params.role || Role.USER,
      params.email,
      params.cellphone,
      params.telephone,
      params.isCollectionCompany
    );
  }

  static fromPrimitives(plainData: {
    id: number;
    name: string;
    password: string;
    role: Role;
    email: string;
    active: boolean;
    cellphone: number;
    telephone: number;
    isCollectionCompany: boolean;
  }): User {
    const user = new User(
      plainData.name,
      plainData.password,
      plainData.role,
      plainData.email,
      plainData.cellphone,
      plainData.telephone,
      plainData.isCollectionCompany
    );
    user.id = plainData.id;
    user.active = plainData.active;
    return user;
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      password: this.password,
      role: this.role,
      email: this.email,
      active: this.active,
      cellphone: this.cellphone,
      telephone: this.telephone,
      isCollectionCompany: this.isCollectionCompany,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private capitalizeName(name: string): string {
    if (!name) {
      return "";
    }

    const lowerCaseName = name.toLowerCase();
    return lowerCaseName.replace(/(^\w)|(\s+\w)/g, (match) =>
      match.toUpperCase()
    );
  }
}
