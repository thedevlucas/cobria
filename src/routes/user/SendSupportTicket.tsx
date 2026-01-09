import { useState } from "react";
import MenuComponent from "../../components/menu/MenuComponent";
import { Button, Container, TextField, Typography } from "@mui/material";
import Swal from "sweetalert2";
import { sendSupportTicket } from "../../helpers/company/Tickets";
import { Form } from "react-router-dom";

export default function SendSupportTicket() {
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!subject || !message) {
      Swal.fire({
        title: "Error",
        text: "Por favor, rellena todos los campos.",
        icon: "error",
      });
    }

    await sendSupportTicket(subject, message);

    setSubject("");
    setMessage("");
  };

  return (
    <div className="all">
      {MenuComponent()}
      <Container maxWidth="sm" sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Enviar ticket de soporte
        </Typography>
        <Form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Asunto"
            variant="outlined"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Mensaje"
            variant="outlined"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ width: "100%" }}
          >
            Enviar
          </Button>
        </Form>
      </Container>
    </div>
  );
}
