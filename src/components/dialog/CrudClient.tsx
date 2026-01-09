// Dependencies
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
// Styles
import { crudDialogButton, crudDialogTextField } from "../../styles/CrudStyle";
// Helpers
// Constants
import { createClient, modifyClient } from "../../helpers/company/ClientHelper";

export default function crudClient(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  modifyRow: Record<string, any> | null,
  request: string
) {
  // Variables
  // Title & Button
  const title = request == "POST" ? "Crear cliente" : "Modificar cliente";
  // States
  const [name, setName] = useState<string>("");
  const [activity, setActivity] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [segment, setSegment] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Change value of states if request is PUT
  useEffect(() => {
    if (request === "PUT") {
      if (modifyRow != null) {
        // Set values
        setName(modifyRow.name);
        setActivity(modifyRow.activity);
        setService(modifyRow.service);
        setAddress(modifyRow.address);
        setSegment(modifyRow.segment);
        setPhone(modifyRow.phone);
      } else {
        setOpen(false);
        Swal.fire({
          title: "Error",
          text: "No se ha seleccionado un cliente",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } else {
      setName("");
      setActivity("");
      setService("");
      setAddress("");
      setSegment("");
      setPhone("");
    }
  }, [open, modifyRow]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
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
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          variant="filled"
          label="Actividad"
          sx={crudDialogTextField}
        />
        <TextField
          fullWidth
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          variant="filled"
          label="Dirección"
          sx={crudDialogTextField}
        />
        <TextField
          fullWidth
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          variant="filled"
          label="Rubro"
          sx={crudDialogTextField}
        />
        <TextField
          fullWidth
          value={service}
          onChange={(e) => setService(e.target.value)}
          variant="filled"
          label="Servicio"
          sx={crudDialogTextField}
        />
        <TextField
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          variant="filled"
          label="Telefono"
          sx={crudDialogTextField}
        />
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
          onClick={() => {
            const requestData = {
              name: name,
              activity: activity,
              address: address,
              segment: segment,
              service: service,
              phone: phone,
            };
            if (modifyRow != null && request === "PUT") {
              modifyClient({ ...requestData, id: modifyRow.id });
            } else {
              createClient(requestData);
            }
          }}
        >
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
