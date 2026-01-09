import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Lightbulb,
  Close,
  Send,
} from "@mui/icons-material";
import { API_URL } from "../../constants/Constants";

interface AIFeedbackProps {
  messageId?: string;
  chatType: "whatsapp" | "call";
  originalMessage: string;
  onClose?: () => void;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({
  messageId,
  chatType,
  originalMessage,
  onClose,
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const [category, setCategory] = useState<"positive" | "negative" | "suggestion">("positive");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError("Por favor ingresa tu feedback");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/api/ai/feedback`,
        {
          messageId,
          chatType,
          originalMessage,
          feedback: feedback.trim(),
          rating,
          category,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err.response?.data?.error || "Error al enviar feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRating(0);
    setCategory("positive");
    setFeedback("");
    setSuccess(false);
    setError("");
    if (onClose) onClose();
  };

  return (
    <>
      {/* Feedback Button */}
      <Tooltip title="Dar feedback sobre esta respuesta">
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            color: "#666",
            "&:hover": {
              color: "#1976d2",
              bgcolor: "#e3f2fd",
            },
          }}
        >
          <Lightbulb fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Feedback Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                💬 Feedback de IA
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ayúdanos a mejorar las respuestas
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              ¡Gracias por tu feedback! Esto nos ayuda a mejorar.
            </Alert>
          ) : (
            <Box>
              {/* Original Message */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  mb: 3,
                  borderLeft: "4px solid #1976d2",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Mensaje original:
                </Typography>
                <Typography variant="body2">
                  {originalMessage || "Sin mensaje"}
                </Typography>
                <Chip
                  label={chatType === "whatsapp" ? "WhatsApp" : "Llamada"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              {/* Rating */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ¿Cómo calificarías esta respuesta?
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Rating
                    value={rating}
                    onChange={(_, newValue) => setRating(newValue)}
                    size="large"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#ffd700",
                      },
                    }}
                  />
                  {rating !== null && rating > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {rating === 5
                        ? "Excelente"
                        : rating === 4
                        ? "Muy bueno"
                        : rating === 3
                        ? "Bueno"
                        : rating === 2
                        ? "Regular"
                        : "Necesita mejorar"}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Category */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tipo de feedback
                </Typography>
                <ToggleButtonGroup
                  value={category}
                  exclusive
                  onChange={(_, newCategory) => newCategory && setCategory(newCategory)}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="positive" sx={{ textTransform: "none" }}>
                    <ThumbUp fontSize="small" sx={{ mr: 1 }} />
                    Positivo
                  </ToggleButton>
                  <ToggleButton value="negative" sx={{ textTransform: "none" }}>
                    <ThumbDown fontSize="small" sx={{ mr: 1 }} />
                    Negativo
                  </ToggleButton>
                  <ToggleButton value="suggestion" sx={{ textTransform: "none" }}>
                    <Lightbulb fontSize="small" sx={{ mr: 1 }} />
                    Sugerencia
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Feedback Text */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label={
                  category === "positive"
                    ? "¿Qué te gustó?"
                    : category === "negative"
                    ? "¿Qué podría mejorar?"
                    : "Tu sugerencia"
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escribe tu feedback aquí..."
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Tips */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#e3f2fd",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  💡 <strong>Tip:</strong> Tu feedback ayuda a mejorar las respuestas de la IA
                  para futuras conversaciones con deudores.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        {!success && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !feedback.trim()}
              startIcon={<Send />}
              sx={{
                bgcolor: "#1976d2",
                "&:hover": {
                  bgcolor: "#1565c0",
                },
              }}
            >
              {loading ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default AIFeedback;

