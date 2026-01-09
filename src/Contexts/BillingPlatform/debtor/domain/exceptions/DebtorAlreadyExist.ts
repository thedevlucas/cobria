export class DebtorAlreadyExistException extends Error {
  constructor() {
    super("El deudor ya existe");
  }
}
