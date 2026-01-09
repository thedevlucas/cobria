// Css
import "/src/static/css/table/Table.css";
// Dependencies
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
// Components
import MenuComponent from "../../components/menu/MenuComponent";
import { DataTable, SearchFields } from "../../components/TableComponent";
// Helpers
import {
  getAndTransformDebtors,
  columnsDebtor,
  deleteDebtor,
} from "../../helpers/chat/ModifyDebtor";
import filterSearch from "../../helpers/SearchFilter";
// Styles
import { crudButtonStyle } from "../../styles/TableStyle";
import CrudDebtor from "../../components/dialog/CrudDebtor";
import Bills from "../../components/dialog/Bills";

export default function Debtor() {
  // States
  const [selectValue, setSelectValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  // State for crud
  const [open, setOpen] = useState<boolean>(false);
  const [openBill, setOpenBill] = useState<boolean>(false);
  // Request state for crud
  const [request, setRequest] = useState<string>("POST");
  // Select values map
  const mapSelectValuesSearch: Record<string, string> = {
    name: "string",
    document: "number",
    user_email: "email",
    paid: "string",
  };
  // Rows and columns
  // Rows

  useEffect(() => {
    getAndTransformDebtors().then((data: Array<Record<string, any>>) => {
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
    <div className="table-all-container">
      <CrudDebtor
        open={open}
        setOpen={setOpen}
        modifyRow={selectedRow}
        request={request}
      />
      <Bills open={openBill} setOpen={setOpenBill} modifyRow={selectedRow} />
      <MenuComponent />
      <main>
        <div className="table-container">
          <h1>Configuración de deudores</h1>
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
                user_email: "Correo_Usuario",
                document: "Documento",
                paid: "Estado",
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
              columns: columnsDebtor,
              setSelectedRowSchema: setSelectedRow,
            }}
          />
          <div className="table-modify">
            <Button
              variant="contained"
              sx={crudButtonStyle}
              onClick={() => setOpenBill(true)}
            >
              Facturas
            </Button>
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
                  deleteDebtor(Number(selectedRow.id));
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
