import {
  Box,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
  NativeSelect,
  InputBase,
  styled,
} from "@mui/material";
import {
  PhoneNumber,
  searchPhoneNumbers,
} from "../../helpers/agents/TwilioService";
import { useState } from "react";
import { postAgents } from "../../helpers/agents/AgentsHelpers";
import { countriesForSelect } from "../../constants/Constants";
import Swal from "sweetalert2";

interface SelectedNumber {
  phone: string;
  name: string;
  months: number;
}

type RequestAgents = {
  agents: SelectedNumber[];
};

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

const PhoneNumberViewer = () => {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<SelectedNumber[]>([]);
  const [country, setCountry] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [timeForReservation, setTimeForReservation] = useState<
    Record<string, number>
  >({});

  const handleChange = (
    event: { target: { value: string } },
    phone: string
  ) => {
    const agent = selectedNumbers.find((num) => num.phone === phone);

    if (!agent) {
      return;
    }

    agent.months = parseInt(event.target.value);

    setSelectedNumbers((prev) =>
      prev.map((num) => (num.phone === phone ? agent : num))
    );

    setTimeForReservation((prev) => {
      return { ...prev, [phone]: parseInt(event.target.value) };
    });
  };

  const handleSearch = async () => {
    if (!country) {
      setError("Por favor, selecciona un país antes de buscar.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const results = await searchPhoneNumbers(country);

      setNumbers(results);
    } catch (error) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Ocurrio un error al buscar los numeros",
      });
    }
    setLoading(false);
  };

  const toggleNumberSelection = (phoneNumber: string) => {
    setSelectedNumbers((prev) => {
      const isSelected = prev.some((num) => num.phone === phoneNumber);
      if (isSelected) {
        // Si ya está seleccionado, lo eliminamos
        return prev.filter((num) => num.phone !== phoneNumber);
      } else {
        // Si no está seleccionado, lo añadimos
        timeForReservation[phoneNumber] = 1;

        return [
          ...prev,
          {
            phone: phoneNumber,
            name: "",
            months: 1,
          },
        ];
      }
    });
  };

  const handleOpenModal = () => {
    if (selectedNumbers.length === 0) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Debes seleccionar al menos un numero",
      });
      return;
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleNameChange = (phoneNumber: string, name: string) => {
    setSelectedNumbers((prev) =>
      prev.map((num) => (num.phone === phoneNumber ? { ...num, name } : num))
    );
  };

  const handleSubmit = () => {
    const requestAgents: RequestAgents = {
      agents: selectedNumbers,
    };
    postAgents(requestAgents);
    setSelectedNumbers([]);
    setOpenModal(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 4 }}>
      <Typography variant="h3" gutterBottom>
        Reserva tus agentes de cobranza personal
      </Typography>
      <Typography variant="h6" gutterBottom>
        Buscar Número de Teléfono para tú Agente
      </Typography>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginBottom: 4,
        }}
        noValidate
        autoComplete="off"
      >
        {/* Select para escoger el país */}
        <TextField
          select
          label="Selecciona un país"
          SelectProps={{ native: true }}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }} // <- Esta línea soluciona el problema
        >
          <option value="">-- Seleccionar --</option>
          {countriesForSelect.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </TextField>
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Buscar Números"
          )}
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Números Disponibles
      </Typography>
      <Divider />
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleOpenModal}
        sx={{ marginTop: 2 }}
      >
        Asignar Nombres y Comprar
      </Button>
      {numbers.length === 0 ? (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          No se encontraron números.
        </Typography>
      ) : (
        <List style={{ marginTop: 2, maxHeight: 300, overflow: "auto" }}>
          {numbers.map((number) => (
            <ListItem
              key={number.phone_number}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Checkbox
                checked={selectedNumbers.some(
                  (num) => num.phone === number.phone_number
                )}
                onChange={() => toggleNumberSelection(number.phone_number)}
              />
              <ListItemText primary={number.friendly_name} />
              <ListItemText primary={"$ " + number.price} />
            </ListItem>
          ))}
        </List>
      )}

      {/* Modal para asignar nombres */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Asignar nombres a los números seleccionados</DialogTitle>
        <DialogContent>
          {selectedNumbers.map((num) => (
            <Box key={num.phone} sx={{ marginBottom: 2 }}>
              <Typography variant="body1">{num.phone}</Typography>
              <TextField
                label="Nombre del Teléfono"
                variant="outlined"
                fullWidth
                value={num.name}
                onChange={(e) => handleNameChange(num.phone, e.target.value)}
              />
              <FormControl sx={{ mt: 1 }} variant="standard" fullWidth>
                <InputLabel htmlFor="demo-customized-select-native">
                  Meses de reserva
                </InputLabel>
                <NativeSelect
                  id="demo-customized-select-native"
                  value={timeForReservation[num.phone]}
                  onChange={(e) => handleChange(e, num.phone)}
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
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Solicitar Compra
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhoneNumberViewer;
