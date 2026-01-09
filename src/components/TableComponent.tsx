// Dependencies
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  DataGrid,
  GridRowId,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { useState, useEffect } from "react";
// Styles
import { selectFieldStyle } from "../styles/TableStyle";
// Schemas
import { searchValuesSchema, tableSchema } from "../schemas/TableSchema";
// Helpers
import { createTextFieldWithIcon } from "../helpers/table/TableHelper";
import { formatDate2Csv } from "../helpers/table/TableHelper";

interface SearchFieldsProps {
  searchValuesSchema: searchValuesSchema;
}

export const SearchFields = ({ searchValuesSchema }: SearchFieldsProps) => {
  return (
    <div className="search-table-container">
      <FormControl sx={selectFieldStyle}>
        <InputLabel>Filtrar por...</InputLabel>
        <Select
          value={searchValuesSchema.selectState.getter}
          onChange={(e) =>
            searchValuesSchema.selectState.setter(e.target.value)
          }
        >
          {Object.keys(searchValuesSchema.selectMap).map((key, index) => {
            return (
              <MenuItem key={index} value={key}>
                {searchValuesSchema.selectMap[key]}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {createTextFieldWithIcon(searchValuesSchema.searchState)}
    </div>
  );
};

function CustomToolBar(): JSX.Element {
  const [fileName, setFileName] = useState<string>("");
  useEffect(() => {
    formatDate2Csv("Excel").then((date) => {
      setFileName(date);
    });
  }, []);
  return (
    <GridToolbarContainer>
      <GridToolbarExport
        csvOptions={{
          fileName: fileName,
          allColumns: true,
          delimeter: ";",
        }}
      />
    </GridToolbarContainer>
  );
}

interface DataTableProps {
  tableSchema: tableSchema;
}

export const DataTable = ({ tableSchema }: DataTableProps) => {
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  return (
    <div className="table">
      <DataGrid
        rows={tableSchema.rows}
        columns={tableSchema.columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        localeText={{
          toolbarExport: "Exportar",
          toolbarExportCSV: "Exportar a CSV",
          toolbarExportPrint: "Imprimir",
        }}
        slots={{
          toolbar: CustomToolBar,
        }}
        checkboxSelection
        disableColumnMenu
        slotProps={{ pagination: { labelRowsPerPage: "Filas por página" } }}
        rowSelectionModel={selectionModel}
        hideFooterSelectedRowCount
        onRowSelectionModelChange={(selection: any) => {
          const selectedId = selection.slice(-1)[0];
          const selectedRow = tableSchema.rows.filter(
            (row) => row.id === selectedId
          )[0];
          tableSchema.setSelectedRowSchema(selectedRow);
          if (selection.length > 1) {
            const selectionSet = new Set(selectionModel);
            const result = selection.filter((s: any) => !selectionSet.has(s));
            setSelectionModel(result);
          } else {
            setSelectionModel(selection);
          }
        }}
      />
    </div>
  );
};
