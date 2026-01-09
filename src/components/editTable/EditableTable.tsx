import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { getClients } from "../../helpers/company/ClientHelper";
interface EditableTableProps {
  data: { [key: string]: string | number }[];
  onDataChange: (index: number, field: string, value: string | number) => void;
}

const StyledTableContainer = styled(TableContainer)({
  maxHeight: "350px",
  borderRadius: "20px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTableCell = styled(TableCell)({
  fontSize: "0.875rem",
  color: "#333",
  borderBottom: "1px solid #e0e0e0",
});

const EditableTable: React.FC<EditableTableProps> = ({
  data,
  onDataChange,
}) => {
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);

  // Obtén los clientes al montar el componente
  useEffect(() => {
    async function fetchClients() {
      const clientData = await getClients();
      if (clientData) {
        setClients(clientData); // Asegúrate de que `getClients` devuelva un array con { id, name }
      }
    }

    fetchClients();
  }, []);

  return (
    <Paper style={{ borderRadius: "20px" }}>
      <StyledTableContainer>
        <Table aria-label="editable table">
          <TableHead>
            <TableRow>
              {/* Definir columnas */}
              {Object.keys(data[0] || {}).map(
                (header) =>
                  header !== "Cliente" && ( // Excluir "Cliente" para el input
                    <StyledTableCell key={header}>{header}</StyledTableCell>
                  )
              )}
              <StyledTableCell>Cliente</StyledTableCell> {/* Columna fija */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <StyledTableRow key={index}>
                {Object.keys(row).map((field) =>
                  field === "Cliente" ? ( // Reemplazar input por select en "Cliente"
                    <StyledTableCell key={field}>
                      <select
                        onChange={(e) =>
                          onDataChange(index, field, e.target.value)
                        }
                        value={row[field].toString()}
                        style={{
                          width: "200px",
                          padding: "4px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                        }}
                      >
                        <option value="" disabled>
                          Selecciona un cliente
                        </option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.name}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </StyledTableCell>
                  ) : (
                    <StyledTableCell key={field}>
                      <input
                        value={row[field].toString()}
                        onChange={(e) =>
                          onDataChange(index, field, e.target.value)
                        }
                        style={{
                          width: `${Math.max(
                            row[field].toString().length * 8,
                            100
                          )}px`,
                          padding: "4px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                        }}
                      />
                      {/* Mostrar valor para celdas normales */}
                    </StyledTableCell>
                  )
                )}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Paper>
  );
};

export default EditableTable;
