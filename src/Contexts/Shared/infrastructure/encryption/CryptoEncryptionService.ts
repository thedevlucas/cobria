import * as crypto from "crypto";

import { EncryptionService } from "./EncryptionService";

export class CryptoEncryptionService implements EncryptionService {
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(algorithm: string, key: string, iv: string) {
    this.algorithm = algorithm;

    this.key = Buffer.from(key, "hex");
    this.iv = Buffer.from(iv, "hex");

    if (this.key.length !== 16) {
      throw new Error(`Invalid CRYPT_KEY length: ${this.key.length} bytes (expected 16 for AES-128)`);
    }

    if (this.iv.length !== 16) {
      throw new Error(`Invalid CRYPT_IV length: ${this.iv.length} bytes (expected 16)`);
    }
  }


  encrypt(data: string): string {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let newText = cipher.update(data, "utf8", "hex");
      newText += cipher.final("hex");
      return newText;
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  decrypt(data: string): string {
    try {
      const cipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let newText = cipher.update(data, "hex", "utf8");
      newText += cipher.final("utf8");
      return newText;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error(`Failed to decrypt data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
