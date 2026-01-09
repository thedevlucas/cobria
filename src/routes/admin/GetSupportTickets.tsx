import { useEffect, useState } from "react";
import { userRedirect } from "../../helpers/user/CheckAdmin";
import { useNavigate } from "react-router-dom";
import filterSearch from "../../helpers/SearchFilter";
import crudUser from "../../components/dialog/CrudUser";
import MenuComponent from "../../components/menu/MenuComponent";
import { GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { crudButtonStyle } from "../../styles/TableStyle";
import { closeTicket, getTickets } from "../../helpers/company/Tickets";
import { DataTable, SearchFields } from "../../components/TableComponent";

export default function GetSupportTickets() {
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
  const [request] = useState<string>("POST");
  // Select values map
  const mapSelectValuesSearch: Record<string, string> = {
    idCompany: "number",
  };
  // Rows and columns
  // Rows
  useEffect(() => {
    userRedirect(navigate);

    getTickets("support").then((data: TicketType[]) => {
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
          <h1>Tickets de soporte</h1>
          <SearchFields
            searchValuesSchema={{
              selectMap: {
                idCompany: "ID Empresa",
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
              columns: costTableColumns,
              setSelectedRowSchema: setSelectedRow,
            }}
          />
          <div className="table-modify">
            <Button
              variant="contained"
              sx={crudButtonStyle}
              onClick={() => {
                if (selectedRow !== null) {
                  closeTicket((selectedRow as TicketType).id);
                }
              }}
            >
              Cerrar Ticket
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

const costTableColumns: GridColDef[] = [
  {
    field: "idCompany",
    headerName: "ID Empresa",
    flex: 1,
  },
  {
    field: "subject",
    headerName: "Asunto",
    flex: 1,
  },
  {
    field: "message",
    headerName: "Mensaje",
    flex: 1,
  },
  {
    field: "status",
    headerName: "Estado",
    flex: 1,
  },
  {
    field: "createdAt",
    headerName: "Fecha de creación",
    flex: 1,
  },
];

export type TicketType = {
  id: number;
  idCompany: number;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};
