import { excelColumns } from "../../../../../config/Constants";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { CompanyExistById } from "../../../company/domain/services/CompanyExistById";
import { SendEmailMessage } from "../services/SendEmailMessage";
import { WorkbookToJson } from "../services/WorkbookToJson";

export class ProcessWorkbookForEmail {
  private readonly columnsConfig: Record<string, any>;

  constructor(
    private readonly workbookToJsonService: WorkbookToJson,
    private readonly sendEmailMessageService: SendEmailMessage,
    private readonly companyExistById: CompanyExistById
  ) {
    this.columnsConfig = JSON.parse(excelColumns());
  }

  async run(params: {
    workbook: any;
    idCompany: number;
    idClient: number;
    countryCode?: string;
  }): Promise<void> {
    const companyExist = await this.companyExistById.run({
      companyId: params.idCompany,
    });

    if (!companyExist) throw new CompanyNotFoundException();

    const workbookJson = await this.workbookToJsonService.run(
      params.workbook,
      this.columnsConfig
    );

    for (const row of workbookJson) {
      // For email, we need to look for email columns instead of telephone columns
      const emailKeyNames = Object.keys(workbookJson[0]).filter((key: string) => {
        const lowerKey = key.toLowerCase();
        const emailKeywords = this.columnsConfig.email_alternatives || ["email", "correo"];
        return emailKeywords.some((keyword: string) => 
          lowerKey.includes(keyword.toLowerCase())
        );
      });

      // If no email columns found, try to use telephone columns as fallback
      const emails = emailKeyNames.length > 0 
        ? emailKeyNames.map((key) => row[key])
        : []; // For now, we'll require email columns

      if (emails.length === 0) {
        console.warn("No email columns found in the workbook for row:", row);
        continue;
      }

      await this.sendEmailMessageService.run({
        row: row,
        emails,
        idCompany: params.idCompany,
        idClient: params.idClient,
        countryCode: params.countryCode,
      });
    }
  }
}
