import { useEffect, useState } from "react";
import MenuComponent from "../../components/menu/MenuComponent";
import PhoneNumberViewer from "../../components/phoneNumberViewer/PhoneNumberViewer";
import { getAgents } from "../../helpers/agents/AgentsHelpers";
import { DataTable } from "../../components/TableComponent";
import { GridColDef } from "@mui/x-data-grid";

export default function Agentes() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    getAgents().then((data) => {
      if (data) {
        setAgents(data);
      }
    });
  }, []);

  return (
    <div className="all">
      <MenuComponent />
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <div className="table-container">
          <h1>Mis Agentes Contratados</h1>
          <DataTable
            tableSchema={{
              rows: agents,
              columns: agentsColumns,
              setSelectedRowSchema: () => {}, 
            }}
          />
        </div>
        <hr />
        <PhoneNumberViewer />
      </div>
    </div>
  );
}

const agentsColumns: GridColDef[] = [
  {
    field: "name",
    headerName: "Nombre del Agente",
    flex: 1,
  },
  {
    field: "phone",
    headerName: "Número de Teléfono",
    flex: 1,
  },
  {
    field: "monthsToExpire",
    headerName: "Meses Contratados",
    flex: 1,
  },
  {
    field: "expireAt",
    headerName: "Fecha de Vencimiento",
    flex: 1,
    valueFormatter: (value: any) => {
      if (!value) return "Pendiente";
      return new Date(value).toLocaleDateString();
    },
  },
];