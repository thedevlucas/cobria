// import { EntitySchema } from "typeorm";
// import { Interaction } from "../../domain/Interaction";

// export const InteractionEntity = new EntitySchema<Interaction>({
//   name: "Interaction",
//   tableName: "interaction",
//   target: Interaction,
//   columns: {
//     id: {
//       type: Number,
//       primary: true,
//       generated: true,
//     },
//     idDebtor: {
//       type: Number,
//       nullable: false,
//       name: "id_debtor",
//     },
//     text: {
//       type: String,
//       nullable: false,
//     },
//     createdAt: {
//       type: "timestamp",
//       name: "created_at",
//       createDate: true,
//     },
//   },
//   relations: {
//     debtor: {
//       target: "Debtor",
//       type: "many-to-one",
//       joinColumn: {
//         name: "id_debtor",
//       },
//       inverseSide: "interactions",
//     },
//   },
// });
