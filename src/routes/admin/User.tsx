// Css
import "/src/static/css/table/Table.css";
// Dependencies
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
// Components
import MenuComponent from "../../components/menu/MenuComponent";
import crudUser from "../../components/dialog/CrudUser";
// Helpers
import {
  getAndTransformUsers,
  columnsUser,
  changeStateUser,
  deleteUser,
} from "../../helpers/user/ModifyUser";
import filterSearch from "../../helpers/SearchFilter";
import { userRedirect } from "../../helpers/user/CheckAdmin";
// Styles
import { crudButtonStyle } from "../../styles/TableStyle";
import { DataTable, SearchFields } from "../../components/TableComponent";

export default function User() {
  // Variables
  const navigate = useNavigate();
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
  const mapSelectValuesSearch: Record<string, string> = {
    name: "string",
    role: "string",
    email: "email",
  };
  // Rows and columns
  // Rows
  useEffect(() => {
    userRedirect(navigate);
    getAndTransformUsers().then((data: Array<Record<string, any>>) => {
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
      {crudUser(open, setOpen, selectedRow, request)}
      <MenuComponent />
      <main>
        <div className="table-container">
          <h1>Configuración de usuarios</h1>
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
                role: "Rol",
                email: "Correo",
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
              columns: columnsUser,
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
                  changeStateUser(Number(selectedRow.id));
                }
              }}
            >
              Activar/Desactivar
            </Button>
            <Button
              variant="contained"
              sx={crudButtonStyle}
              onClick={() => {
                if (selectedRow != null) {
                  deleteUser(Number(selectedRow.id));
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
