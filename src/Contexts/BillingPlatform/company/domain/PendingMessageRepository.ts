import { PendingMessage } from "./PendingMessages";

export interface PendingMessageRepository {
  save(pendingMessage: PendingMessage): Promise<void>;
  findAll(): Promise<PendingMessage[]>;
}
