import "/src/static/css/table/Table.css";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuComponent from "../../components/menu/MenuComponent";
import { getAssociatedAgents } from "../../helpers/user/ModifyUser";
import filterSearch from "../../helpers/SearchFilter";
import { userRedirect } from "../../helpers/user/CheckAdmin";
import { crudButtonStyle } from "../../styles/TableStyle";
import { GridColDef } from "@mui/x-data-grid";
import SetAgentDialog from "../../components/dialog/SetAgent";
import { DataTable, SearchFields } from "../../components/TableComponent";

export default function SetAgent() {
  const navigate = useNavigate();
  const [selectValue, setSelectValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [open, setOpen] = useState<boolean>(false);
  
  const mapSelectValuesSearch: Record<string, string> = {
    user_name: "string",
    user_email: "email",
  };

  useEffect(() => {
    userRedirect(navigate);
    getAssociatedAgents().then((data: Array<Record<string, any>>) => {
      if(!data) return;

      const formattedRows = data.map((company) => {
        const agent = (company.agents && company.agents.length > 0) ? company.agents[0] : {};
        
        return {
          id: company.id,
          user_name: company.user_name,
          user_email: company.user_email,
          agent_name: agent.agent_name || "",
          phone: agent.phone || "",
          expire: agent.expire || "",
          expire_at: agent.expire_at ? new Date(agent.expire_at).toLocaleDateString() : "",
          all_agents: company.agents 
        };
      });

      setRows(
        filterSearch(
          formattedRows,
          mapSelectValuesSearch[selectValue] || "string",
          selectValue || "user_name",
          searchValue
        )
      );
    });
  }, [selectValue, searchValue]);

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
                user_name: "Nombre",
                user_email: "Correo",
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
                if(selectedRow) setOpen(true);
              }}
              disabled={!selectedRow}
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
  { field: "user_name", headerName: "Empresa", flex: 1 },
  { field: "user_email", headerName: "Correo", flex: 1 },
  { field: "agent_name", headerName: "Nombre Agente", flex: 1 },
  { field: "phone", headerName: "Teléfono", flex: 1 },
  { field: "expire", headerName: "Meses", flex: 1 },
  { field: "expire_at", headerName: "Vence", flex: 1 },
];