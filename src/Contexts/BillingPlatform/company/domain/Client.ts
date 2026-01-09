import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";
import { Company } from "./Company";

export class Client extends AggregateRoot {
  id!: number;
  name: string;
  activity: string;
  address: string;
  service: string;
  phone: string;
  segment: string;
  id_company: number;
  company!: Company | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    name: string,
    idCompany: number,
    activity: string,
    address: string,
    service: string,
    segment: string,
    phone: string
  ) {
    super();
    this.name = name;
    this.activity = activity;
    this.address = address;
    this.service = service;
    this.segment = segment;
    this.id_company = idCompany;
    this.phone = phone;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    name: string;
    idCompany: number;
    activity: string;
    address: string;
    service: string;
    segment: string;
    phone: string;
  }) {
    return new Client(
      params.name,
      params.idCompany,
      params.activity,
      params.address,
      params.service,
      params.segment,
      params.phone
    );
  }

  static fromJSON(json: {
    name: string;
    idCompany: number;
    activity: string;
    address: string;
    service: string;
    segment: string;
    phone: string;
  }) {
    return new Client(
      json.name,
      json.idCompany,
      json.activity,
      json.address,
      json.service,
      json.segment,
      json.phone
    );
  }

  update(params: {
    name: string;
    activity: string;
    address: string;
    service: string;
    segment: string;
    phone: string;
  }) {
    this.name = params.name;
    this.activity = params.activity;
    this.address = params.address;
    this.service = params.service;
    this.segment = params.segment;
    this.phone = params.phone;
    this.updatedAt = new Date();
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      activity: this.activity,
      address: this.address,
      service: this.service,
      segment: this.segment,
      phone: this.phone,
      id_company: this.id_company,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
