export class CompanyNotFoundException extends Error {
  statusCode: number;

  constructor() {
    super("No se encontró el usuario");
    this.statusCode = 404;
  }
}
