export interface EmailService {
  send(props: { to: string; subject: string; body: string }): Promise<void>;
}
