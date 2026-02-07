import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";
import { companyRepository } from "../../../Shared/infrastructure/dependencies";
import { Client } from "./Client";
import { MessagesSchedule } from "./MessagesSchedule";
import { PendingMessage } from "./PendingMessages";

export enum Role {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  USER = "user",
}

export class Company extends AggregateRoot {
  id!: number;
  name: string;
  password: string;
  role: Role;
  email: string;
  companyName: string;
  active: boolean;
  cellphone: number | null;
  telephone: number | null;
  isCollectionCompany: boolean;
  clients!: Client[];
  schedules!: MessagesSchedule[];
  pendingMessages!: PendingMessage[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: string,
    password: string,
    role: Role,
    email: string,
    active: boolean,
    cellphone: number | null,
    telephone: number | null,
    isCollectionCompany: boolean,
    companyName: string
  ) {
    super();
    this.name = this.capitalizeName(name);
    this.password = password;
    this.role = role;
    this.email = email;
    this.active = active;
    this.cellphone = cellphone;
    this.telephone = telephone;
    this.isCollectionCompany = isCollectionCompany;
    this.companyName = companyName;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    name: string;
    password: string;
    role: Role;
    email: string;
    cellphone: number | null;
    telephone: number | null;
    isCollectionCompany: boolean;
    companyName: string;
  }): Company {
    return new Company(
      params.name,
      params.password,
      params.role || Role.USER,
      params.email,
      true,
      params.cellphone,
      params.telephone,
      params.isCollectionCompany,
      params.companyName
    );
  }

  static fromPrimitives(plainData: {
    id: number;
    name: string;
    password: string;
    role: Role;
    email: string;
    cellphone: number | null;
    telephone: number | null;
    isCollectionCompany: boolean;
    companyName: string;
  }): Company {
    return new Company(
      plainData.name,
      plainData.password,
      plainData.role,
      plainData.email,
      true,
      plainData.cellphone,
      plainData.telephone,
      plainData.isCollectionCompany,
      plainData.companyName
    );
  }

  addClient(client: Client) {
    if (!this.clients) {
      this.clients = [];
    }

    this.clients.push(client);
  }

  updateClient(client: Client) {
    if (!this.clients) {
      return;
    }

    const index = this.clients.findIndex((c) => c.id === client.id);

    if (index < 0) {
      return;
    }

    this.clients[index] = client;
  }

  removeClient(client: Client) {
    if (!this.clients) {
      return;
    }

    this.clients = this.clients.filter((c) => c.id !== client.id);
  }

  removeMessagesSchedule() {
    if (!this.schedules) {
      this.schedules = [];
    }

    this.schedules = [];
  }

  addMessagesSchedule(schedule: MessagesSchedule) {
    if (!this.schedules) {
      this.schedules = [];
    }

    this.schedules.push(schedule);
  }

  addPendingMessage(pendingMessage: PendingMessage) {
    if (!this.pendingMessages) {
      this.pendingMessages = [];
    }

    const alreadyExists = this.pendingMessages.some(
      (pm) =>
        pm.company_id === pendingMessage.company_id &&
        pm.phone_number === pendingMessage.phone_number &&
        pm.message === pendingMessage.message &&
        pm.type === pendingMessage.type &&
        pm.status === pendingMessage.status &&
        pm.from_number === pendingMessage.from_number
    );

    if (alreadyExists) {
      return;
    }

    this.pendingMessages.push(pendingMessage);
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
      companyName: this.companyName,
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
