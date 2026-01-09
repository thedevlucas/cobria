// Dependencies
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
// Styles
import { crudDialogButton, crudDialogTextField } from "../../styles/CrudStyle";
// Helpers
import { HandleNumberChange } from "../../helpers/HandleTextFieldChange";
import { createDebtor, modifyDebtor } from "../../helpers/chat/ModifyDebtor";
// Constants
import { string2PaidStatus, paidStatus } from "../../constants/Constants";

interface CrudDebtorProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modifyRow: Record<string, any> | null;
  request: string;
}

export default function CrudDebtor({
  open = false,
  setOpen,
  modifyRow,
  request,
}: CrudDebtorProps) {
  // Variables
  // Title & Button
  const title = request == "POST" ? "Crear Deudor" : "Modificar Dedudor";
  // States
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [document, setDocument] = useState<string>("");
  const [paid, setPaid] = useState<string>("");
  // Change value of states if request is PUT
  useEffect(() => {
    if (request === "PUT") {
      if (modifyRow != null) {
        // Set values for editing
        setName(modifyRow.name);
        // Show debtor's email if it exists, not user_email
        setEmail(modifyRow.email || ""); // Debtor's contact email
        setDocument(modifyRow.document);
        setPaid(string2PaidStatus[modifyRow.paid]);
      } else {
        setOpen(false);
        Swal.fire({
          title: "Error",
          text: "No se ha seleccionado un deudor",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } else {
      // Reset form for creating new debtor
      setName("");
      setEmail(""); // Empty for new debtor
      setDocument("");
      setPaid("No contact"); // Default status
    }
  }, [open, modifyRow, request]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="filled"
          label="Correo (opcional)"
          placeholder="correo@ejemplo.com"
          helperText="Email de contacto del deudor (opcional)"
          sx={crudDialogTextField}
        />
        <TextField
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="filled"
          label="Nombre"
          sx={crudDialogTextField}
        />
        <TextField
          fullWidth
          value={document}
          onChange={HandleNumberChange(setDocument)}
          variant="filled"
          label="Documento"
          sx={crudDialogTextField}
        />
        <FormControl fullWidth variant="filled" sx={crudDialogTextField}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={paid}
            label="Estado"
            onChange={(e) => setPaid(e.target.value as string)}
          >
            {Object.keys(paidStatus).map((key: string) => {
              return (
                <MenuItem key={key} value={key}>
                  {paidStatus[key]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          sx={crudDialogButton}
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          sx={crudDialogButton}
          onClick={async () => {
            const requestData = {
              name: name,
              email: email || undefined, // Don't send empty string, send undefined
              document: Number(document),
              paid: paid,
            };
            
            // Success callback to close modal and refresh
            const onSuccess = () => {
              setOpen(false);
              // Refresh the page to show updated data
              window.location.reload();
            };
            
            if (modifyRow != null && request === "PUT") {
              await modifyDebtor({ ...requestData, id: modifyRow.id }, onSuccess);
            } else {
              await createDebtor(requestData, onSuccess);
            }
          }}
        >
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
