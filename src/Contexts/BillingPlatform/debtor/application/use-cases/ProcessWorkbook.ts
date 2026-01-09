import { excelColumns } from "../../../../../config/Constants";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { CompanyExistById } from "../../../company/domain/services/CompanyExistById";
import { SendStartingMessage } from "../services/SendStartingMessage";
import { WorkbookToJson } from "../services/WorkbookToJson";

export class ProcessWorkbook {
  private readonly columnsConfig: Record<string, any>;

  constructor(
    private readonly workbookToJsonService: WorkbookToJson,
    private readonly sendStartingMessageService: SendStartingMessage,
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
    console.log("🔄 ProcessWorkbook: Starting workbook processing...");
    console.log(`📊 ProcessWorkbook: Company: ${params.idCompany}, Client: ${params.idClient}, Country: ${params.countryCode}`);
    
    const companyExist = await this.companyExistById.run({
      companyId: params.idCompany,
    });

    if (!companyExist) {
      console.error("❌ ProcessWorkbook: Company not found");
      throw new CompanyNotFoundException();
    }
    console.log("✅ ProcessWorkbook: Company exists");

    const workbookJson = await this.workbookToJsonService.run(
      params.workbook,
      this.columnsConfig
    );
    console.log(`📋 ProcessWorkbook: Parsed ${workbookJson.length} rows from workbook`);

    for (const row of workbookJson) {
      console.log(`📝 ProcessWorkbook: Processing row - Name: ${row.nombre}, Document: ${row.cedula}`);
      
      const telephoneKeyNames = Object.keys(workbookJson[0]).filter((key: string) => {
        const lowerKey = key.toLowerCase();
        const telephoneKeywords = this.columnsConfig.telephone_alternatives || [this.columnsConfig.telephone];
        return telephoneKeywords.some((keyword: string) => 
          lowerKey.includes(keyword.toLowerCase())
        );
      });

      const telephones = telephoneKeyNames.map((key) => row[key]);
      console.log(`📱 ProcessWorkbook: Found telephones: ${telephones.join(', ')}`);

      await this.sendStartingMessageService.run({
        row: row,
        telephones,
        idCompany: params.idCompany,
        idClient: params.idClient,
        countryCode: params.countryCode,
      });
    }
    
    console.log("✅ ProcessWorkbook: All rows processed successfully");
  }
}
