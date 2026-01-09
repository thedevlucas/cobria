import cron from "node-cron";
import { ProcessPendingMessages } from "../Contexts/BillingPlatform/chat/application/services/ProcessPendingMessages";
import {
  callChatRepository,
  chatRepository,
  companyRepository,
  costRepository,
  debtorRepository,
  pendingMessageRepository,
} from "../Contexts/Shared/infrastructure/dependencies";
import { TwillioCommunication } from "../Contexts/BillingPlatform/chat/infrastructure/TwillioCommunication";
import { ValidateScheduleConfig } from "../Contexts/BillingPlatform/debtor/application/services/ValidateScheduleConfig";
import { ListMessageSchedule } from "../Contexts/BillingPlatform/company/application/use-cases/ListMessageSchedule";

cron.schedule("0 * * * *", async () => {
  console.log("running a task every hour");

  const sendPendingMessages = new ProcessPendingMessages(
    pendingMessageRepository,
    new ValidateScheduleConfig(new ListMessageSchedule(companyRepository)),
    new TwillioCommunication(),
    costRepository,
    debtorRepository,
    callChatRepository,
    chatRepository
  );

  await sendPendingMessages.run();
});
