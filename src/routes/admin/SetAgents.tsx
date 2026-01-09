// Css
import "/src/static/css/table/Table.css";
// Dependencies
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
// Components
import MenuComponent from "../../components/menu/MenuComponent";
// Helpers
import { getAssociatedAgents } from "../../helpers/user/ModifyUser";
import filterSearch from "../../helpers/SearchFilter";
import { userRedirect } from "../../helpers/user/CheckAdmin";
// Styles
import { crudButtonStyle } from "../../styles/TableStyle";
import { GridColDef } from "@mui/x-data-grid";
import SetAgentDialog from "../../components/dialog/SetAgent";
import { DataTable, SearchFields } from "../../components/TableComponent";

export default function SetAgent() {
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
  // Select values map
  const mapSelectValuesSearch: Record<string, string> = {
    name: "string",
    email: "email",
  };
  // Rows and columns
  // Rows
  useEffect(() => {
    userRedirect(navigate);
    getAssociatedAgents().then((data: Array<Record<string, any>>) => {
      const flattenAgents = data.map((user) => ({
        id: user.id,
        user_name: user.user_name,
        user_email: user.user_email,
        ...(user.agents.length > 0
          ? user.agents[0]
          : {
              agent_name: "",
              phone: "",
              expire: "",
              expire_at: "",
            }),
      }));

      setRows(
        filterSearch(
          flattenAgents,
          mapSelectValuesSearch[selectValue],
          selectValue,
          searchValue
        )
      );
    });
  }, []);
  return (
    <div className="table-all-container">
      {SetAgentDialog(open, setOpen, selectedRow)}
      <MenuComponent />
      <main>
        <div className="table-container">
          <h1>Asociar agentes</h1>
          <SearchFields
            searchValuesSchema={{
              selectMap: {
                name: "Nombre",
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
              columns: setAgentsColumns,
              setSelectedRowSchema: setSelectedRow,
            }}
          />
          <div className="table-modify">
            <Button
              variant="contained"
              sx={crudButtonStyle}
              onClick={() => {
                setOpen(true);
              }}
            >
              Asociar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

const setAgentsColumns: GridColDef[] = [
  {
    field: "user_name",
    headerName: "Nombre",
    flex: 1,
  },
  {
    field: "user_email",
    headerName: "Correo",
    flex: 1,
  },
  {
    field: "agent_name",
    headerName: "Nombre Agente",
    flex: 1,
  },
  {
    field: "phone",
    headerName: "Teléfono",
    flex: 1,
  },
  {
    field: "expire",
    headerName: "Mes",
    flex: 1,
  },
  {
    field: "expire_at",
    headerName: "Fecha Vence",
    flex: 1,
  },
];
