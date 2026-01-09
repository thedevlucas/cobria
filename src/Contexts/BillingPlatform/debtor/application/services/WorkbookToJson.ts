import { httpError } from "../../../../../config/CustomError";
import { WorkbookProcessor, WorkbookRow } from "../../domain/WorkbookProcessor";

export class WorkbookToJson {
  constructor(private readonly workbookProcessor: WorkbookProcessor) {}

  async run(workbook: any, columnsConfig: any): Promise<WorkbookRow[]> {
    const workbookJson = this.workbookProcessor.process(workbook);

    this.validateColumns(workbookJson, columnsConfig);

    return workbookJson;
  }

  private validateColumns(data: Array<WorkbookRow>, columnsConfig: any): void {
    // Check for telephone columns using flexible matching
    const telephoneKeyNames = Object.keys(data[0]).filter((key: string) => {
      const lowerKey = key.toLowerCase();
      
      // Check if column contains any of the telephone keywords
      const telephoneKeywords = columnsConfig.telephone_alternatives || [columnsConfig.telephone];
      return telephoneKeywords.some((keyword: string) => 
        lowerKey.includes(keyword.toLowerCase())
      );
    });

    if (telephoneKeyNames.length === 0) {
      throw new httpError(
        `No se encontraron columnas de teléfonos en el archivo. Buscando columnas que contengan: ${(columnsConfig.telephone_alternatives || [columnsConfig.telephone]).join(', ')}`,
        400
      );
    }

    // Check required columns with flexible matching
    const requiredColumns = columnsConfig.required.every((requiredCol: string) => {
      const alternatives = columnsConfig.required_alternatives?.[requiredCol] || [requiredCol];
      return Object.keys(data[0]).some((columnName: string) => {
        const lowerColumnName = columnName.toLowerCase();
        return alternatives.some((alternative: string) => 
          lowerColumnName.includes(alternative.toLowerCase())
        );
      });
    });

    if (!requiredColumns) {
      const missingColumns = columnsConfig.required.filter((requiredCol: string) => {
        const alternatives = columnsConfig.required_alternatives?.[requiredCol] || [requiredCol];
        return !Object.keys(data[0]).some((columnName: string) => {
          const lowerColumnName = columnName.toLowerCase();
          return alternatives.some((alternative: string) => 
            lowerColumnName.includes(alternative.toLowerCase())
          );
        });
      });
      
      throw new httpError(
        `No se encontraron todas las columnas requeridas en el archivo. Faltan: ${missingColumns.join(', ')}. Buscando columnas que contengan: ${missingColumns.map((col: string) => (columnsConfig.required_alternatives?.[col] || [col]).join(' o ')).join(', ')}`,
        400
      );
    }
  }
}
