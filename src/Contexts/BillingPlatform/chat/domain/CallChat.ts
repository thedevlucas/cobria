import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";

export class CallChat extends AggregateRoot {
  id!: string;
  readonly id_user: number;
  readonly from_cellphone: number;
  readonly to_cellphone: number;
  readonly message: string;
  readonly createdAt?: Date;
  readonly status: boolean;

  constructor(
    id_user: number,
    from_cellphone: number,
    to_cellphone: number,
    message: string,
    createdAt: Date,
    status: boolean
  ) {
    super();
    this.id_user = id_user;
    this.from_cellphone = from_cellphone;
    this.to_cellphone = to_cellphone;
    this.message = message;
    this.createdAt = createdAt;
    this.status = status;
  }
  static create(params: {
    idUser: number;
    fromCellphone: number;
    toCellphone: number;
    message: string;
    status?: boolean;
  }) {
    return new CallChat(
      params.idUser,
      params.fromCellphone,
      params.toCellphone,
      params.message,
      new Date(),
      params.status || true
    );
  }
  static fromJSON(json: {
    id_user: number;
    from_cellphone: number;
    to_cellphone: number;
    message: string;
    status: boolean;
  }) {
    return new CallChat(
      json.id_user,
      json.from_cellphone,
      json.to_cellphone,
      json.message,
      new Date(),
      json.status
    );
  }

  setId(id: string) {
    this.id = id;
  }

  toPrimitives() {
    return {
      id: this.id,
      id_user: this.id_user,
      from_cellphone: this.from_cellphone,
      to_cellphone: this.to_cellphone,
      message: this.message,
      createdAt: this.createdAt,
      status: this.status,
    };
  }
}
