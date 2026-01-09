import { DataSource } from "typeorm";
import { TypeOrmConfig } from "./TypeOrmConfig";
import { DebtorEntity } from "../../../BillingPlatform/debtor/infrastructure/typeorm/DebtorEntity";
import { CompanyEntity } from "../../../BillingPlatform/company/infrastructure/typeorm/CompanyEntity";
import { DebtImageEntity } from "../../../BillingPlatform/debtor/infrastructure/typeorm/DebtImageEntity";
import { TelephoneEntity } from "../../../BillingPlatform/debtor/infrastructure/typeorm/TelephoneEntity";
import { CellphoneEntity } from "../../../BillingPlatform/debtor/infrastructure/typeorm/CellphoneEntity";
import { ClientEntity } from "../../../BillingPlatform/company/infrastructure/typeorm/ClientEntity";
import { environment } from "../../../../config/Constants";
import { MessagesScheduleEntity } from "../../../BillingPlatform/company/infrastructure/typeorm/MessagesScheduleEntity";
import { TicketEntity } from "../../../BillingPlatform/company/infrastructure/typeorm/TicketEntity";
import { AgentEntity } from "../../../BillingPlatform/agent/infrastructure/typeorm/AgentEntity";
import { CostEntity } from "../../../BillingPlatform/cost/infrastructure/typeorm/CostEntity";
import { PendingMessageEntity } from "../../../BillingPlatform/company/infrastructure/typeorm/PendinMessageEntity";

export class TypeOrmClientFactory {
  private static clients: { [key: string]: DataSource } = {};

  static async createClient(
    contextName: string,
    config: TypeOrmConfig
  ): Promise<DataSource> {
    let client = TypeOrmClientFactory.getClient(contextName);

    if (!client) {
      client = await TypeOrmClientFactory.createAndConnectClient(config);

      TypeOrmClientFactory.registerClient(client, contextName);
    }

    return client;
  }

  private static getClient(contextName: string): DataSource | null {
    return TypeOrmClientFactory.clients[contextName];
  }

  private static async createAndConnectClient(
    config: TypeOrmConfig
  ): Promise<DataSource> {
    const client = new DataSource({
      type: "postgres",
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      entities: [
        DebtorEntity,
        CompanyEntity,
        ClientEntity,
        DebtImageEntity,
        TelephoneEntity,
        CellphoneEntity,
        MessagesScheduleEntity,
        TicketEntity,
        AgentEntity,
        CostEntity,
        PendingMessageEntity,
      ],
      ssl:
        environment === "dev"
          ? false
          : {
              rejectUnauthorized: false,
            },
      synchronize: false, // Disable schema synchronization to avoid conflicts with Sequelize
      logging: environment === "dev", // Only log in development
    });

    await client.initialize();

    return client;
  }

  private static registerClient(client: DataSource, contextName: string): void {
    TypeOrmClientFactory.clients[contextName] = client;
  }
}
