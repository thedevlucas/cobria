import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";

export class Chat extends AggregateRoot {
  id!: string;
  readonly id_user: number;
  readonly from_cellphone: number;
  readonly to_cellphone: number;
  readonly message: string;
  readonly createdAt?: Date;
  readonly image?: Buffer;
  readonly image_type?: string;
  readonly status?: boolean;

  constructor(
    id_user: number,
    from_cellphone: number,
    to_cellphone: number,
    message: string,
    createdAt: Date,
    image: Buffer,
    image_type: string,
    status: boolean
  ) {
    super();
    this.id_user = id_user;
    this.from_cellphone = from_cellphone;
    this.to_cellphone = to_cellphone;
    this.message = message;
    this.createdAt = createdAt;
    this.image = image;
    this.image_type = image_type;
    this.status = status;
  }

  static create(params: {
    idUser: number;
    fromCellphone: number;
    toCellphone: number;
    message: string;
    createdAt?: Date;
    image?: Buffer;
    imageType?: string;
    status?: boolean;
  }) {
    return new Chat(
      params.idUser,
      params.fromCellphone,
      params.toCellphone,
      params.message,
      new Date(),
      params.image || Buffer.from(""),
      params.imageType || "",
      params.status || true
    );
  }

  static fromJSON(json: {
    id_user: number;
    from_cellphone: number;
    to_cellphone: number;
    message: string;
    image?: Buffer;
    image_type?: string;
    status?: boolean;
  }) {
    return new Chat(
      json.id_user,
      json.from_cellphone,
      json.to_cellphone,
      json.message,
      new Date(),
      json.image || Buffer.from(""),
      json.image_type || "",
      json.status || true
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
      image: this.image,
      image_type: this.image_type,
      status: this.status,
    };
  }
}
