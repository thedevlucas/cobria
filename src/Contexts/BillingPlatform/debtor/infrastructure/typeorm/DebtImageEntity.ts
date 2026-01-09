import { EntitySchema } from "typeorm";
import { DebtImage, DebtImageType } from "../../domain/DebtImage";

export const DebtImageEntity = new EntitySchema<DebtImage>({
  name: "DebtImage",
  tableName: "debtor_images",
  target: DebtImage,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    id_debtor: {
      type: Number,
      nullable: false,
    },
    image: {
      type: String,
      nullable: false,
    },
    type: {
      type: String,
      enum: DebtImageType,
      nullable: false,
    },
  },
});
