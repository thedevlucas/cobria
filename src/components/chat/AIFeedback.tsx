import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, IconButton, Tooltip, Typography } from "@mui/material";
import { Lightbulb } from "@mui/icons-material";
import { API_URL } from "../../constants/Constants";

interface AIFeedbackProps {
  debtorCellphone: string | number; 
  originalMessage: string;
  onClose?: () => void;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ debtorCellphone, originalMessage }) => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!feedback.trim()) return setError("Ingresa una instrucción");
    try {
      setLoading(true);
      setError("");
      await axios.post(`${API_URL}/api/ai/feedback`, {
        debtorCellphone,
        feedback: feedback.trim()
      }, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
      setSuccess(true);
      setTimeout(() => { setOpen(false); setSuccess(false); setFeedback(""); }, 2000);
    } catch (err) { setError("Error al enviar"); } finally { setLoading(false); }
  };

  return (
    <>
      <Tooltip title="Entrenar IA"><IconButton size="small" onClick={() => setOpen(true)} sx={{ color: "#1976d2" }}><Lightbulb /></IconButton></Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Instrucción para futuras respuestas</DialogTitle>
        <DialogContent>
          {success ? <Alert severity="success">Entrenamiento guardado.</Alert> : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption">Respuesta a corregir:</Typography>
              <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: "#f5f5f5" }}>{originalMessage}</Typography>
              <TextField fullWidth multiline rows={3} label="¿Qué debería corregir la IA?" placeholder="Ej: No menciones descuentos todavía." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={handleSubmit} variant="contained" disabled={loading}>Entrenar IA</Button></DialogActions>
      </Dialog>
    </>
  );
};

export default AIFeedback;