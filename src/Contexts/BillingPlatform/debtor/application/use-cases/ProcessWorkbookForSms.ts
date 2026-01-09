import { excelColumns } from "../../../../../config/Constants";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { CompanyExistById } from "../../../company/domain/services/CompanyExistById";
import { SendSmsMessage } from "../services/SendSmsMessage";
import { WorkbookToJson } from "../services/WorkbookToJson";

export class ProcessWorkbookForSms {
  private readonly columnsConfig: Record<string, any>;

  constructor(
    private readonly workbookToJsonService: WorkbookToJson,
    private readonly sendSmsMessageService: SendSmsMessage,
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
      const telephoneKeyNames = Object.keys(workbookJson[0]).filter((key: string) => {
        const lowerKey = key.toLowerCase();
        const telephoneKeywords = this.columnsConfig.telephone_alternatives || [this.columnsConfig.telephone];
        return telephoneKeywords.some((keyword: string) => 
          lowerKey.includes(keyword.toLowerCase())
        );
      });

      const telephones = telephoneKeyNames.map((key) => row[key]);

      await this.sendSmsMessageService.run({
        row: row,
        telephones,
        idCompany: params.idCompany,
        idClient: params.idClient,
        countryCode: params.countryCode,
      });
    }
  }
}
