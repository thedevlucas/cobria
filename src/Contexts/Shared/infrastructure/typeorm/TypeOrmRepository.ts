import { DataSource, EntitySchema, Repository } from "typeorm";
import { AggregateRoot } from "../../domain/AggregateRoot";

export abstract class TypeOrmRepository<T extends AggregateRoot> {
  constructor(private readonly _client: Promise<DataSource>) {}

  protected abstract entitySchema(): EntitySchema<T>;

  protected client(): Promise<DataSource> {
    return this._client;
  }

  protected async repository(): Promise<Repository<T>> {
    return (await this._client).getRepository(this.entitySchema());
  }

  protected async persist(aggregateRoot: T): Promise<void> {
    const repository = await this.repository();
    await repository.save(aggregateRoot as any);
  }

  protected async persistAndReturn(aggregateRoot: T): Promise<T> {
    const repository = await this.repository();
    return await repository.save(aggregateRoot as any);
  }
}
