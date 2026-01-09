import * as bcrypt from "bcrypt";

import { password_salt } from "../../../../config/Constants";
import { HashService } from "./HashService";

export class BcryptHashService implements HashService {
  private readonly salts: number;

  constructor() {
    this.salts = password_salt;
  }

  hash(data: string): string {
    return bcrypt.hashSync(data, this.salts);
  }

  compare(data: string, encrypted: string): boolean {
    return bcrypt.compareSync(data, encrypted);
  }
}
