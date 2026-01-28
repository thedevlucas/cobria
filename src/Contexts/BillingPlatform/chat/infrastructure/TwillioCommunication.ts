import twilio from "twilio";
import { Communication } from "../domain/Communication";
import {
  account_sid,
  auth_token_twilio,
  backend_host,
  gptPromptsJson,
} from "../../../../config/Constants";
import { TWILIO_WHATSAPP_TEMPLATES } from "../../../../config/Twillio";
import { Client } from "../../company/domain/Client";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";

export class TwillioCommunication implements Communication {
  twilioClient: twilio.Twilio;

  constructor() {
    this.twilioClient = twilio(account_sid, auth_token_twilio);
  }

  private cleanDigits(input: string): string {
    return (input || "").toString().replace(/\D/g, "");
  }

  private formatWhatsapp(phone: string): string {
    const digits = this.cleanDigits(phone);

    if (!digits || digits.length < 10 || digits.length > 15) {
      throw new Error("Invalid WhatsApp phone number");
    }

    return `whatsapp:+${digits}`;
  }

  private buildGreetingText(debtorName: string, companyName?: string, client?: Client | null): string {
    const base = (gptPromptsJson?.prompt_greeting || "").toString();
    const msg = base.replace(/\$\{debtorName\}/g, (debtorName || "").toString());

    if (client) {
      const cName = (client?.name ?? "").toString();
      const cPhone = (client?.phone ?? "").toString();
      const cAddress = (client?.address ?? "").toString();
      const comp = (companyName ?? "").toString();

      const extra = [
        comp ? `Empresa: ${comp}` : "",
        cName ? `Cliente: ${cName}` : "",
        cPhone ? `Teléfono: ${cPhone}` : "",
        cAddress ? `Dirección: ${cAddress}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      return extra ? `${msg}\n\n${extra}` : msg;
    }

    return msg;
  }

  async makePhoneCall(params: {
    from: string;
    to: string;
    message: string;
    idUser: number;
  }): Promise<void> {
    const language = gptPromptsJson.language;

    await this.twilioClient.calls.create({
      from: "+" + this.cleanDigits(params.from),
      to: "+" + this.cleanDigits(params.to),
      twiml: `<Response>
                        <Gather input="speech" language="${language}" actionOnEmptyResult="true" action="${backend_host}/api/call/incoming">
                            <Say language="${language}">${params.message}</Say>
                        </Gather>
                    </Response>
            `,
    });
  }

  async sendWhatsappMessage(params: {
    idUser: number;
    from: string;
    to: string;
    message: string;
  }): Promise<{ cost: string }> {
    const response = await this.twilioClient.messages.create({
      body: params.message,
      from: this.formatWhatsapp(params.from),
      to: this.formatWhatsapp(params.to),
    });

    return { cost: response.price };
  }

  async sendFirstMessage(params: {
    idUser: number;
    from: string;
    to: string;
    debtorName: string;
    client?: Client | null;
    companyName?: string;
  }): Promise<{ cost: number; message: string }> {
    let response: MessageInstance;

    const fromNumber = this.formatWhatsapp(params.from);
    const toNumber = this.formatWhatsapp(params.to);

    const trySendTemplate = async (
      contentSid: string,
      variables: Record<string, string>
    ): Promise<MessageInstance> => {
      return await this.twilioClient.messages.create({
        contentSid,
        contentVariables: JSON.stringify(variables),
        from: fromNumber,
        to: toNumber,
      });
    };

    const tryFallbackBody = async (): Promise<MessageInstance> => {
      const body = this.buildGreetingText(params.debtorName, params.companyName, params.client);
      return await this.twilioClient.messages.create({
        body,
        from: fromNumber,
        to: toNumber,
      });
    };

    if (params.client) {
      const companyName = (params.companyName ?? "").toString();
      const clientName = (params.client?.name ?? "").toString();
      const clientPhone = (params.client?.phone ?? "").toString();
      const clientAddress = (params.client?.address ?? "").toString();
      const debtorName = (params.debtorName ?? "").toString();

      const candidates: Record<string, string>[] = [
        { "1": debtorName, "2": companyName, "3": clientName, "4": clientName, "5": clientPhone, "6": clientAddress, "7": clientName },
      ];

      for (const vars of candidates) {
        try {
          response = await trySendTemplate(
            TWILIO_WHATSAPP_TEMPLATES.GREETINGS_MESSAGE_WITH_CLIENT,
            vars
          );
          return { cost: Number(response.price) || 0, message: response.body };
        } catch (err: any) {
          if (err?.code !== 21656) throw err;
        }
      }

      response = await tryFallbackBody();
      return { cost: Number(response.price) || 0, message: response.body || this.buildGreetingText(params.debtorName, params.companyName, params.client) };
    }

    const debtorName = (params.debtorName ?? "").toString();

    const candidates: Record<string, string>[] = [
      { "1": debtorName },
      { "2": debtorName },
      { "1": debtorName, "2": debtorName },
    ];

    for (const vars of candidates) {
      try {
        response = await trySendTemplate(
          TWILIO_WHATSAPP_TEMPLATES.GREETINGS_MESSAGE,
          vars
        );
        return { cost: Number(response.price) || 0, message: response.body };
      } catch (err: any) {
        if (err?.code !== 21656) throw err;
      }
    }

    response = await tryFallbackBody();
    return { cost: Number(response.price) || 0, message: response.body || this.buildGreetingText(params.debtorName) };
  }

  async sendSmsMessage(params: {
    idUser: number;
    from: string;
    to: string;
    message: string;
  }): Promise<{ cost: number; message: string }> {
    const response = await this.twilioClient.messages.create({
      body: params.message,
      from: `+${this.cleanDigits(params.from)}`,
      to: `+${this.cleanDigits(params.to)}`,
    });

    return {
      cost: Number(response.price) || 0.0075,
      message: response.body || params.message,
    };
  }

  async sendEmailMessage(params: {
    idUser: number;
    from: string;
    to: string;
    subject: string;
    message: string;
  }): Promise<{ cost: number; message: string }> {
    console.log(
      `Email would be sent to ${params.to} with subject: ${params.subject}`
    );

    return {
      cost: 0.001,
      message: `Email sent to ${params.to}`,
    };
  }

  async answerCallMessage(params: { message: string }): Promise<string> {
    const language = gptPromptsJson.language;
    const twiml = new VoiceResponse();

    twiml.say({ language }, params.message);

    twiml.gather({
      input: ["speech"],
      language: language,
      action: `${backend_host}/api/call/incoming`,
      actionOnEmptyResult: true,
    });

    return twiml.toString();
  }
}
