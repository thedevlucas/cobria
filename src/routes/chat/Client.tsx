// Css
import "/src/static/css/table/Table.css";
// Dependencies
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
// Components
import MenuComponent from "../../components/menu/MenuComponent";
import crudClient from "../../components/dialog/CrudClient";
// Helpers
import {
  getClients,
  columnsClient,
  deleteClient,
} from "../../helpers/company/ClientHelper";
import filterSearch from "../../helpers/SearchFilter";
// Styles
import { crudButtonStyle } from "../../styles/TableStyle";
import { DataTable, SearchFields } from "../../components/TableComponent";

export default function Client() {
  // States
  const [selectValue, setSelectValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  // State for crud
  const [open, setOpen] = useState<boolean>(false);
  // Request state for crud
  const [request, setRequest] = useState<string>("POST");
  // Select values map
  const mapSelectValuesSearch: Record<string, string> = {};
  // Rows and columns
  // Rows
  useEffect(() => {
    getClients().then((data: Array<Record<string, any>>) => {
      setRows(
        filterSearch(
          data,
          mapSelectValuesSearch[selectValue],
          selectValue,
          searchValue
        )
      );
    });
  }, []);
  return (
    <>
      <div className="table-all-container">
        {crudClient(open, setOpen, selectedRow, request)}
        <MenuComponent />
        <main>
          <div className="table-container">
            <h1>Configuración de clientes</h1>
            <Button
              variant="contained"
              sx={crudButtonStyle}
              onClick={() => {
                setOpen(true);
                setRequest("POST");
              }}
            >
              Crear
            </Button>
            <SearchFields
              searchValuesSchema={{
                selectMap: {
                  name: "Nombre",
                  activity: "Actividad",
                  service: "Servicios",
                  segment: "Rubro",
                  address: "Direccion",
                },
                searchState: {
                  getter: searchValue,
                  setter: setSearchValue,
                },
                selectState: {
                  getter: selectValue,
                  setter: setSelectValue,
                },
              }}
            />
            <DataTable
              tableSchema={{
                rows: rows,
                columns: columnsClient,
                setSelectedRowSchema: setSelectedRow,
              }}
            />
            <div className="table-modify">
              <Button
                variant="contained"
                sx={crudButtonStyle}
                onClick={() => {
                  setRequest("PUT");
                  setOpen(true);
                }}
              >
                Modificar
              </Button>
              <Button
                variant="contained"
                sx={crudButtonStyle}
                onClick={() => {
                  if (selectedRow != null) {
                    deleteClient(Number(selectedRow.id));
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
