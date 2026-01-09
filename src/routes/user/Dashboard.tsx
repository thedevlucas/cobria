import { useEffect, useState } from "react";
import MenuComponent from "../../components/menu/MenuComponent";
import { GridColDef } from "@mui/x-data-grid";
import filterSearch from "../../helpers/SearchFilter";
import { getAndTransformDebtors } from "../../helpers/chat/ModifyDebtor";
import { Button, List, ListItem, ListItemText, Modal } from "@mui/material";
import { DataTable, SearchFields } from "../../components/TableComponent";

export function Dashboard() {
  const [openInteractionsModal, setOpenInteractionsModal] =
    useState<boolean>(false);
  const [selectValue, setSelectValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const mapSelectValuesSearch: Record<string, string> = {
    name: "string",
  };

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
  }, [rows]);

  return (
    <div className="table-all-container">
      <MenuComponent />
      <main>
        <div className="table-container">
          <h1>Reporte de interacciones</h1>
          <SearchFields
            searchValuesSchema={{
              selectMap: {
                name: "Deudor",
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
              disabled={!selectedRow}
              variant="contained"
              onClick={() => setOpenInteractionsModal(true)}
            >
              Ver interacciones
            </Button>
          </div>
        </div>
      </main>
      <Modal
        open={openInteractionsModal}
        onClose={() => setOpenInteractionsModal(false)}
      >
        <div
          style={{
            width: "600px", // Ancho del modal
            height: "500px", // Altura del modal
            margin: "120px auto auto auto", // Centrar horizontal y verticalmente
            padding: "20px", // Espaciado interno
            borderRadius: "8px", // Bordes redondeados
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
          }}
        >
          <h2>Interacciones</h2>

          <List
            style={{
              overflow: "auto",
              maxHeight: "400px",
              marginBottom: "20px",
            }}
          >
            {selectedRow?.events.split(",").map((event: string) => (
              <ListItem key={event} alignItems="flex-start">
                <ListItemText primary={event} />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            onClick={() => {
              setOpenInteractionsModal(false);
            }}
          >
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const costTableColumns: GridColDef[] = [
  {
    field: "name",
    headerName: "Deudor",
    flex: 1,
  },
  {
    field: "events",
    headerName: "Interacciones",
    flex: 1,
  },
  {
    field: "paid",
    headerName: "Estado",
    flex: 1,
  },
];
