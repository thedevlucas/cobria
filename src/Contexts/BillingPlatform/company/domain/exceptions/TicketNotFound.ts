export class TicketNotFoundException extends Error {
  statusCode: number;

  constructor() {
    super("No se encontró el ticket");
    this.statusCode = 404;
  }
}
