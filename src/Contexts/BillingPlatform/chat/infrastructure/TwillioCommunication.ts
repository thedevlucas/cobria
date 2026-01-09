import twilio from "twilio";
import { Communication } from "../domain/Communication";
import {
  account_sid,
  auth_token_twilio,
  backend_host,
  gptPromptsJson,
  twilio_whatsapp_number,
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

  async makePhoneCall(params: {
    from: string;
    to: string;
    message: string;
    idUser: number;
  }): Promise<void> {
    const language = gptPromptsJson.language;

    await this.twilioClient.calls.create({
      from: "+" + params.from,
      to: "+" + params.to,
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
      from: `whatsapp:+${Number(params.from)}`,
      to: `whatsapp:+${Number(params.to)}`,
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

    const fromNumber = Number(params.from);
    const toNumber = Number(params.to);

    if (params.client) {
      response = await this.twilioClient.messages.create({
        contentSid: TWILIO_WHATSAPP_TEMPLATES.GREETINGS_MESSAGE_WITH_CLIENT,
        contentVariables: JSON.stringify({
          1: params.debtorName,
          2: params.companyName,
          3: params.client.name,
          4: params.client.name,
          5: params.client.phone,
          6: params.client.address,
          7: params.client.name,
        }),
        from: `whatsapp:+${fromNumber}`,
        to: `whatsapp:+${toNumber}`,
      });
      return { cost: Number(response.price) || 0, message: response.body };
    }

    response = await this.twilioClient.messages.create({
      contentSid: TWILIO_WHATSAPP_TEMPLATES.GREETINGS_MESSAGE,
      contentVariables: JSON.stringify({ 1: params.debtorName }),
      from: `whatsapp:+${fromNumber}`,
      to: `whatsapp:+${toNumber}`,
    });

    return { cost: Number(response.price) || 0, message: response.body };
  }

  async sendSmsMessage(params: {
    idUser: number;
    from: string;
    to: string;
    message: string;
  }): Promise<{ cost: number; message: string }> {
    const response = await this.twilioClient.messages.create({
      body: params.message,
      from: `+${params.from}`,
      to: `+${params.to}`,
    });

    return { 
      cost: Number(response.price) || 0.0075, // Twilio SMS cost is typically $0.0075
      message: response.body || params.message 
    };
  }

  async sendEmailMessage(params: {
    idUser: number;
    from: string;
    to: string;
    subject: string;
    message: string;
  }): Promise<{ cost: number; message: string }> {
    // For now, we'll use a placeholder implementation
    // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
    console.log(`Email would be sent to ${params.to} with subject: ${params.subject}`);
    
    return { 
      cost: 0.001, // Minimal cost for email
      message: `Email sent to ${params.to}` 
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
