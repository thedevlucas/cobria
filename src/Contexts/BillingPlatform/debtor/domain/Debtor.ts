import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";
import { Cellphone } from "./Cellphone";
import { Telephone } from "./Telephone";

export enum Status {
  CHARGED_OFF = "Charged off",
  OVERDUE = "Overdue",
}

export enum PaymentStatus {
  PAID = "Paid", // Pago total
  NOT_PAID = "Not paid", // No ha pagado
  CONTACT = "Contact", // El usuario se contacto con nosotros
  CONTACTED_WITH_KNOWN = "Contacted with known", // Se contacto con un conocido del usuario
  NO_CONTACT = "No contact",
  PARTIAL_PAID = "Partial Paid", // Pago parcial, cuando se ha pagado una parte de la deuda o menor a la cuota.
  PAYMENT_AGREEMENMT = "Payment agreement", // Acuerdo de pago, cuando nunca ha pagado pero promete asumir la deuda.
  FINANCED_PAYMENT = "Financed payment", // Pago financiado, cuando se acuerda un plan de pagos.
}

export class Debtor extends AggregateRoot {
  id!: number;
  id_user: number;
  name: string;
  document: number;
  email?: string;
  paid: PaymentStatus;
  status: Status;
  events: string;
  readonly createdAt: Date;
  updatedAt: Date;
  telephones!: Telephone[];
  cellphones!: Cellphone[];

  constructor(
    id_user: number,
    name: string,
    document: number,
    paid: PaymentStatus,
    status: Status,
    email?: string
  ) {
    super();
    this.id_user = id_user;
    this.name = name;
    this.document = document;
    this.email = email;
    this.paid = paid;
    this.status = status;
    this.events = "";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    id_user: number;
    name: string;
    status: Status;
    document: number;
  }): Debtor {
    return new Debtor(
      params.id_user,
      params.name,
      params.document,
      PaymentStatus.NO_CONTACT,
      params.status
    );
  }

  static fromPrimitives(plainData: {
    id: number;
    id_user: number;
    name: string;
    document: number;
    paid: PaymentStatus;
    status: Status;
  }) {
    return new Debtor(
      plainData.id_user,
      plainData.name,
      plainData.document,
      plainData.paid,
      plainData.status
    );
  }

  addTelephone(from: number, to: number) {
    if (!this.telephones) {
      this.telephones = [];
    }

    if (this.telephones.find((t) => t.from === from && t.to === to)) {
      return;
    }

    this.telephones.push(new Telephone(from, to, this.id));
  }

  addCellphone(from: number, to: number) {
    if (!this.cellphones) {
      this.cellphones = [];
    }

    if (this.cellphones.find((c) => c.from === from && c.to === to)) {
      return;
    }

    this.cellphones.push(new Cellphone(from, to, this.id));
  }

  toPrimitives() {
    return {
      id: this.id,
      id_user: this.id_user,
      name: this.name,
      document: this.document,
      email: this.email,
      paid: this.paid,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  updateStatus(status: PaymentStatus) {
    this.paid = status;
  }

  addEvent(event: string) {
    const date = new Date().toLocaleString();

    if (!this.events) {
      this.events = "";
    }

    const eventToAdd = `${date} - ${event}`;

    this.events += eventToAdd;
  }
}
