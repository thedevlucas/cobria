export type WorkbookRow = Record<string, any>;

export interface WorkbookProcessor {
  process(workbook: any): Array<WorkbookRow>;
}
