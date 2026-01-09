import { createTransport, Transporter } from "nodemailer";

import { EmailService } from "./EmailService";
import {
  email,
  email_host,
  email_password,
  email_port,
} from "../../../../config/Constants";

export class NodemailerEmailService implements EmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: email_host,
      port: email_port,
      secure: false, // Use STARTTLS instead of SSL
      requireTLS: true,
      auth: {
        user: email,
        pass: email_password,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in development
      },
    });
  }

  async send(props: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: email,
      to: props.to,
      subject: props.subject,
      html: props.body,
    });
  }
}
