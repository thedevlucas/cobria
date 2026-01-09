import { excelColumns } from "../../../../../config/Constants";
import { AgentRepository } from "../../../agent/domain/AgentRepository";
import { Role } from "../../../company/domain/Company";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { CompanyExistById } from "../../../company/domain/services/CompanyExistById";
import { MakeCall } from "../services/MakeCall";
import { WorkbookToJson } from "../services/WorkbookToJson";

export class ProcessWorkbookToMakeCalls {
  private readonly columnsConfig: Record<string, any>;

  constructor(
    private readonly workbookToJsonService: WorkbookToJson,
    private readonly makeCallService: MakeCall,
    private readonly companyExistById: CompanyExistById,
    private readonly agentRepository: AgentRepository
  ) {
    this.columnsConfig = JSON.parse(excelColumns());
  }

  async run(params: {
    workbook: any;
    idCompany: number;
    agentPhoneNumber?: string;
    countryCode?: string;
  }): Promise<void> {
    const companyExist = await this.companyExistById.run({
      companyId: params.idCompany,
    });

    if (!companyExist) throw new CompanyNotFoundException();

    let agentName = "Administradora";
    if (companyExist.role === Role.USER) {
      const agentExist = await this.agentRepository.findByPhoneNumber(
        params.agentPhoneNumber || ""
      );
      if (!agentExist) {
        throw Error(`No se encontró agente con ${params?.agentPhoneNumber}`);
      }
      agentName = agentExist.name;
    }

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

      await this.makeCallService.run({
        row: row,
        telephones,
        idCompany: params.idCompany,
        agentName: agentName,
        agentPhoneNumber: params.agentPhoneNumber,
        countryCode: params.countryCode,
      });
    }
  }
}
