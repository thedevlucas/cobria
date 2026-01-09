import xlsx from "xlsx";

import { WorkbookProcessor } from "../domain/WorkbookProcessor";

export class XlsxWorkbookProcessor implements WorkbookProcessor {
  process(workbook: any): Array<Record<string, any>> {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: Array<Record<string, any>> =
      xlsx.utils.sheet_to_json(sheet);
    // Lowercase the columns of the json file
    return this.lowerCaseColumns(jsonData);
  }

  private lowerCaseColumns(
    jsonData: Array<Record<string, any>>
  ): Array<Record<string, any>> {
    return jsonData.map((row) => {
      const newRow: Record<string, any> = {};

      Object.keys(row).forEach((key) => {
        newRow[key.toLowerCase()] = row[key];
      });

      return newRow;
    });
  }
}
