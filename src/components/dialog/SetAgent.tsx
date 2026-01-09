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
  NativeSelect,
  styled,
  InputBase,
} from "@mui/material";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
// Styles
import { crudDialogButton, crudDialogTextField } from "../../styles/CrudStyle";
import { setAgentToCompany } from "../../helpers/agents/AgentsHelpers";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}));

export default function SetAgentDialog(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  modifyRow: Record<string, any> | null
) {
  // Variables
  // Title & Button
  const title = "Asociar Agente";
  // States
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [timeOfReservation, setTimeOfReservation] = useState<number>(1);

  // Change value of states if request is PUT
  useEffect(() => {
    if (open && !modifyRow) {
      setOpen(false);
      Swal.fire({
        title: "Error",
        text: "No se ha seleccionado un usuario",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }

    setName("");
    setPhone("");
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          variant="filled"
          label="Numero"
          sx={crudDialogTextField}
        />
        <FormControl sx={{ mt: 1 }} variant="standard" fullWidth>
          <InputLabel htmlFor="demo-customized-select-native">
            Meses de reserva
          </InputLabel>
          <NativeSelect
            id="demo-customized-select-native"
            value={timeOfReservation}
            onChange={(e) => setTimeOfReservation(parseInt(e.target.value))}
            input={<BootstrapInput />}
          >
            <option aria-label="None" value="" />
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
          </NativeSelect>
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
          onClick={() => {
            const requestData = {
              name: name,
              months: timeOfReservation,
              phone: phone,
              idCompany: modifyRow?.id,
            };
            setAgentToCompany(requestData);
            setName("");
            setPhone("");
          }}
        >
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
