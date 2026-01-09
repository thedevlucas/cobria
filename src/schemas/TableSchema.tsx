// Dependencies
import { GridColDef } from "@mui/x-data-grid"

export interface searcherSchema{
    getter: string,
    setter: React.Dispatch<React.SetStateAction<string>>
}

export interface searchValuesSchema{
    selectMap: Record<string,any>,
    searchState: searcherSchema,
    selectState: searcherSchema
}
export interface tableSchema{
    rows: Array<Record<string,any>>,
    columns: GridColDef[],
    setSelectedRowSchema: React.Dispatch<React.SetStateAction<Record<string, any> | null>>
}