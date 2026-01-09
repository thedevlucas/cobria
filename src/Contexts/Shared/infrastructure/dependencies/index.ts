import { databaseConfigProps } from "../../../../config/Database";
import { TypeOrmAgentRepository } from "../../../BillingPlatform/agent/infrastructure/typeorm/TypeOrmAgentRepository";
import { MongoCallChatRepository } from "../../../BillingPlatform/chat/infrastructure/MongoCallChatRepository";
import { MongoChatRepository } from "../../../BillingPlatform/chat/infrastructure/MongoChatRepository";
import { TypeOrmCompanyRepository } from "../../../BillingPlatform/company/infrastructure/typeorm/TypeOrmCompanyRepository";
import { TypeOrmPendingMessageRepository } from "../../../BillingPlatform/company/infrastructure/typeorm/TypeOrmPendingMessageRepository";
import { TypeOrmTicketRepository } from "../../../BillingPlatform/company/infrastructure/typeorm/TypeOrmTicketRepository";
import { TypeOrmCostRepository } from "../../../BillingPlatform/cost/infrastructure/typeorm/TypeOrmCostRepository";
import { TypeOrmCellphoneRepository } from "../../../BillingPlatform/debtor/infrastructure/typeorm/TypeOrmCellphoneRepository";
import { TypeOrmDebtorRepository } from "../../../BillingPlatform/debtor/infrastructure/typeorm/TypeOrmDebtorRepository";
import { MongoClientFactory } from "../mongo/MongoClientFactory";
import { TypeOrmClientFactory } from "../typeorm/TypeOrmClientFactory";

const chatMongoClient = MongoClientFactory.createClient("chats", {
  url: process.env.MONGO_URL!,
});
const callChatMongoClient = MongoClientFactory.createClient("call_chats", {
  url: process.env.MONGO_URL!,
});

export const chatRepository = new MongoChatRepository(chatMongoClient);
export const callChatRepository = new MongoCallChatRepository(
  callChatMongoClient
);

const datasourceDebtor = TypeOrmClientFactory.createClient(
  "debtor",
  databaseConfigProps
);

const datasourceCompany = TypeOrmClientFactory.createClient(
  "company",
  databaseConfigProps
);

const datasourceAgent = TypeOrmClientFactory.createClient(
  "agent",
  databaseConfigProps
);

const datasourceCellphone = TypeOrmClientFactory.createClient(
  "cellphone",
  databaseConfigProps
);

const datasourceTelephone = TypeOrmClientFactory.createClient(
  "telephone",
  databaseConfigProps
);

const datasourceTicket = TypeOrmClientFactory.createClient(
  "ticket",
  databaseConfigProps
);

const datasourceCost = TypeOrmClientFactory.createClient(
  "cost",
  databaseConfigProps
);

const datasourcePendingMessage = TypeOrmClientFactory.createClient(
  "pending_message",
  databaseConfigProps
);

export const debtorRepository = new TypeOrmDebtorRepository(datasourceDebtor);

export const companyRepository = new TypeOrmCompanyRepository(
  datasourceCompany
);

export const agentRepository = new TypeOrmAgentRepository(datasourceAgent);
export const cellphoneRepository = new TypeOrmCellphoneRepository(
  datasourceCellphone
);
// export const telephoneRepository = new TypeOrmTelephoneRepository(
//   datasourceTelephone
// );

export const ticketRepository = new TypeOrmTicketRepository(datasourceTicket);

export const costRepository = new TypeOrmCostRepository(datasourceCost);

export const pendingMessageRepository = new TypeOrmPendingMessageRepository(
  datasourcePendingMessage
);
