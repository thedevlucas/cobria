import cron from "node-cron";
import { ProcessPendingMessages } from "../Contexts/BillingPlatform/chat/application/services/ProcessPendingMessages";
import { TwillioCommunication } from "../Contexts/BillingPlatform/chat/infrastructure/TwillioCommunication";
import { 
  pendingMessageRepository,
  chatRepository 
} from "../Contexts/Shared/infrastructure/dependencies";

export const initScheduledJobs = () => {
  console.log("⏰ Inicializando Cron Jobs...");

  const processPendingMessages = new ProcessPendingMessages(
    pendingMessageRepository,
    new TwillioCommunication(),
    chatRepository 
  );

  // Ejecutar cada 5 segundos
  cron.schedule("*/5 * * * * *", async () => {
      await processPendingMessages.run();
  });
};