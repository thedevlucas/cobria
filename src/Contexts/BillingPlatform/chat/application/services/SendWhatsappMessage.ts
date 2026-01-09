import { twilio_whatsapp_number } from "../../../../../config/Constants";
import { Cost, CostType } from "../../../cost/domain/Cost";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";

export class SendWhatsappMessage {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly communicationService: Communication,
    private readonly costRepository: CostRepository
  ) {}

  async run(params: {
    fromNumber: string;
    toNumber: string;
    message: string;
    idUser: number;
  }) {
    try {
      const response = await this.communicationService.sendWhatsappMessage({
        idUser: params.idUser,
        from: params.fromNumber,
        to: params.toNumber,
        message: params.message,
      });

      const cost = Cost.create({
        idCompany: params.idUser,
        amount: Number(response.cost || "0.0339"),
        type: CostType.WHATSAPP,
      });

      const chat = Chat.create({
        idUser: params.idUser,
        fromCellphone: Number(twilio_whatsapp_number),
        toCellphone: Number(params.toNumber),
        message: params.message,
      });

      await Promise.all([
        this.costRepository.save(cost),
        this.chatRepository.save(chat),
      ]);
    } catch (error) {
      console.error(error);

      const chat = Chat.create({
        idUser: params.idUser,
        fromCellphone: Number(twilio_whatsapp_number),
        toCellphone: Number(params.toNumber),
        message: "Error al enviar el mensaje",
        status: false,
      });

      await this.chatRepository.save(chat);
    }
  }
}
