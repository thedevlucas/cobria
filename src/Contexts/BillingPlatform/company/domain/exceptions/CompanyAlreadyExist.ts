export class CompanyAlreadyExistException extends Error {
  statusCode: number;

  constructor() {
    super("Este usuario ya existe");
    this.statusCode = 400;
  }
}
