import { useEffect, useState } from "react";
import { userRedirect } from "../../helpers/user/CheckAdmin";
import { useNavigate } from "react-router-dom";
import filterSearch from "../../helpers/SearchFilter";
import crudUser from "../../components/dialog/CrudUser";
import MenuComponent from "../../components/menu/MenuComponent";
import { GridColDef } from "@mui/x-data-grid";
import { DataTable, SearchFields } from "../../components/TableComponent";
import { getCost } from "../../helpers/user/CostHelper";

export default function Cost() {
  const navigate = useNavigate();
  // States
  const [selectValue, setSelectValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<Record<
    string,
    CostType
  > | null>(null);
  const [data, setData] = useState<Array<Record<string, CostType>>>([]);
  const [rows, setRows] = useState<Array<Record<string, CostType>>>([]);
  // State for crud
  const [open, setOpen] = useState<boolean>(false);
  // Request state for crud
  const [request] = useState<string>("POST");
  // Select values map
  const mapSelectValuesSearch: Record<string, string> = {
    name: "string",
  };

  useEffect(() => {
    userRedirect(navigate);

    getCost(navigate).then((data) => {
      setData(data.data);
    });
  }, []);

  useEffect(() => {
    setRows(
      filterSearch(
        data,
        mapSelectValuesSearch[selectValue],
        selectValue,
        searchValue
      )
    );
  }, [data]);

  return (
    <div className="table-all-container">
      {crudUser(open, setOpen, selectedRow, request)}
      <MenuComponent />
      <main>
        <div className="table-container">
          <h1>Costos por usuario</h1>
          <SearchFields
            searchValuesSchema={{
              selectMap: {
                name: "Nombre",
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
        </div>
      </main>
    </div>
  );
}

const costTableColumns: GridColDef[] = [
  {
    field: "userName",
    headerName: "Nombre",
    flex: 1,
  },
  {
    field: "userEmail",
    headerName: "Correo",
    flex: 1,
  },
  {
    field: "agent",
    headerName: "Agent",
    flex: 1,
  },
  {
    field: "call",
    headerName: "Llamada",
    flex: 1,
  },
  {
    field: "whatsapp",
    headerName: "Whatsapp",
    flex: 1,
  },
  {
    field: "sms",
    headerName: "SMS",
    flex: 1,
  },
  {
    field: "email",
    headerName: "Correo Electronico",
    flex: 1,
  },
  {
    field: "total",
    headerName: "Total",
    flex: 1,
  },
];

export type CostType = {
  id: number;
  userName: string;
  userEmail: string;
  agent: number;
  call: number;
  whatsapp: number;
  sms: number;
  email: number;
  total: number;
};
