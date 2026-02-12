import { PendingMessageRepository } from "../../../company/domain/PendingMessageRepository";
import { TwillioCommunication } from "../../infrastructure/TwillioCommunication";
import { PendingMessageStatus, PendingMessageType } from "../../../company/domain/PendingMessages";
import { ChatRepository } from "../../domain/ChatRepository";
import { Chat } from "../../domain/Chat";

export class ProcessPendingMessages {
  private isProcessing = false;

  constructor(
    private readonly pendingMessageRepository: PendingMessageRepository,
    private readonly twillioCommunication: TwillioCommunication,
    private readonly chatRepository: ChatRepository
  ) {}

  async run(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Obtener mensajes listos
      const pendingMessages = await this.pendingMessageRepository.findReadyToSend();

      if (!pendingMessages || pendingMessages.length === 0) {
        return; 
      }

      console.log(`🚀 Cron: Procesando ${pendingMessages.length} mensajes...`);

      for (const msg of pendingMessages) {
        try {
          const rawFrom = String(msg.from_number || "");
          const rawTo = String(msg.phone_number || "");
          
          const cleanFrom = rawFrom.replace(/\D/g, "");
          const cleanTo = rawTo.replace(/\D/g, ""); 

          if (!cleanTo) {
             console.error(`❌ Error: Mensaje ID ${msg.id} no tiene número destino válido.`);
             msg.status = PendingMessageStatus.ERROR;
             await this.pendingMessageRepository.save(msg);
             continue;
          }

          if (msg.type === PendingMessageType.WHATSAPP) {
            await this.twillioCommunication.sendWhatsappMessage({
              idUser: msg.company_id,
              from: rawFrom,
              to: rawTo,
              message: msg.message,
            });

            console.log(`💾 Guardando chat para: ${cleanTo}`);
            
            const chat = Chat.create({
              idUser: Number(msg.company_id),
              fromCellphone: Number(cleanFrom),
              toCellphone: Number(cleanTo), 
              message: msg.message,
            });
            
            await this.chatRepository.save(chat);

          } else if (msg.type === PendingMessageType.SMS) {
            await this.twillioCommunication.sendSmsMessage({
              idUser: msg.company_id,
              from: rawFrom,
              to: rawTo,
              message: msg.message,
            });
            
            // Opcional: Guardar SMS también si quieres
            /*
            const chatSMS = Chat.create({
              idUser: Number(msg.company_id),
              fromCellphone: Number(cleanFrom),
              toCellphone: Number(cleanTo),
              message: `[SMS] ${msg.message}`,
            });
            await this.chatRepository.save(chatSMS);
            */
          }

          // D. Marcar como enviado en Postgres
          msg.status = PendingMessageStatus.SENT;
          await this.pendingMessageRepository.save(msg);

        } catch (error: any) {
          console.error(`❌ Falló envío Msg ID ${msg.id}:`, error.message);
          
          msg.attempts = (msg.attempts || 0) + 1;
          if (msg.attempts >= 3) {
            msg.status = PendingMessageStatus.ERROR;
          }
          await this.pendingMessageRepository.save(msg);
        }
      }

    } catch (err) {
      console.error("🔥 Error crítico en Cron:", err);
    } finally {
      this.isProcessing = false;
    }
  }
}