import { Debtor } from "../../../debtor/domain/Debtor";

export class ProcessImageMessage {
  constructor() {}

  async run(params: {
    debtor: Debtor;
    fromNumber: string;
    toNumber: string;
    message: string;
    media: Record<string, string>;
  }) {
    // This is a placeholder for the real implementation
  }
}
