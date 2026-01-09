import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  TrendingUp,
  CheckCircle,
  Schedule,
  Person,
  Refresh,
  Edit,
} from "@mui/icons-material";
import { API_URL } from "../../constants/Constants";

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  debtors: number;
  successRate: number;
  averageTime: number;
  nextAction?: string;
}

interface DebtorProgress {
  id: number;
  name: string;
  currentStage: string;
  stageName: string;
  progress: number;
  lastUpdate: string;
  debt: number;
}

interface WorkflowData {
  stages: WorkflowStage[];
  debtorProgress: DebtorProgress[];
  summary: {
    totalDebtors: number;
    activeDebtors: number;
    completedDebtors: number;
    totalDebt: number;
    collectedAmount: number;
    successRate: number;
  };
}

const CollectionDashboard = () => {
  const navigate = useNavigate();
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorProgress | null>(null);
  const [newStage, setNewStage] = useState("");
  const [notes, setNotes] = useState("");

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(`${API_URL}/api/collection-workflow`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkflowData(response.data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching workflow:", err);
      setError(err.response?.data?.error || "Error al cargar datos");
      if (err.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWorkflow, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStage = async () => {
    if (!selectedDebtor || !newStage) return;

    try {
      const token = Cookies.get("token");
      await axios.put(
        `${API_URL}/api/collection-workflow/debtor/${selectedDebtor.id}/stage`,
        { stage: newStage, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditDialog(false);
      setSelectedDebtor(null);
      setNewStage("");
      setNotes("");
      fetchWorkflow();
    } catch (err: any) {
      console.error("Error updating stage:", err);
      setError("Error al actualizar la etapa");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (name: string) => {
    switch (name) {
      case "initial_contact":
        return "#2196f3";
      case "follow_up":
        return "#ff9800";
      case "negotiation":
        return "#9c27b0";
      case "payment_arrangement":
        return "#4caf50";
      case "collection_complete":
        return "#00c853";
      default:
        return "#757575";
    }
  };

  const getStageName = (name: string) => {
    switch (name) {
      case "initial_contact":
        return "Contacto Inicial";
      case "follow_up":
        return "Seguimiento";
      case "negotiation":
        return "Negociación";
      case "payment_arrangement":
        return "Acuerdo de Pago";
      case "collection_complete":
        return "Completado";
      default:
        return name;
    }
  };

  if (loading && !workflowData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a237e" }}>
            🎯 Flujo de Cobranza
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión en tiempo real del proceso de cobranza
          </Typography>
        </Box>
        <Tooltip title="Refrescar datos">
          <IconButton onClick={fetchWorkflow} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {workflowData && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Person sx={{ mr: 1 }} />
                    <Typography variant="h6">Deudores Totales</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {workflowData.summary.totalDebtors}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Schedule sx={{ mr: 1 }} />
                    <Typography variant="h6">En Proceso</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {workflowData.summary.activeDebtors}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography variant="h6">Completados</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {workflowData.summary.completedDebtors}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <TrendingUp sx={{ mr: 1 }} />
                    <Typography variant="h6">Éxito</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {workflowData.summary.successRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Workflow Stages */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Etapas del Flujo de Trabajo
              </Typography>

              <Box sx={{ position: "relative" }}>
                {workflowData.stages.map((stage, index) => (
                  <Box key={stage.id} sx={{ mb: 3 }}>
                    {/* Stage Header */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: getStageColor(stage.name),
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          mr: 2,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {getStageName(stage.name)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stage.description}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip
                          label={`${stage.debtors} deudores`}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${stage.successRate}% éxito`}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ ml: 7 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stage.successRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: getStageColor(stage.name),
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Tiempo promedio: {stage.averageTime} días
                        </Typography>
                        {stage.nextAction && (
                          <Typography
                            variant="caption"
                            sx={{ color: getStageColor(stage.name), fontWeight: 600 }}
                          >
                            Siguiente: {stage.nextAction}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Connector Line */}
                    {index < workflowData.stages.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          height: 30,
                          bgcolor: "#e0e0e0",
                          ml: 2.5,
                          my: 1,
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Debtor Progress Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                👥 Progreso de Deudores
              </Typography>

              <Grid container spacing={2}>
                {workflowData.debtorProgress.slice(0, 12).map((debtor) => (
                  <Grid item xs={12} sm={6} md={4} key={debtor.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: 4,
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {debtor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Deuda: {formatCurrency(debtor.debt)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedDebtor(debtor);
                              setNewStage(debtor.currentStage);
                              setEditDialog(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>

                        <Chip
                          label={debtor.stageName}
                          size="small"
                          sx={{
                            bgcolor: getStageColor(debtor.currentStage) + "20",
                            color: getStageColor(debtor.currentStage),
                            fontWeight: 600,
                            mb: 1,
                          }}
                        />

                        <LinearProgress
                          variant="determinate"
                          value={debtor.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: getStageColor(debtor.currentStage),
                              borderRadius: 3,
                            },
                          }}
                        />

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                          Actualizado: {new Date(debtor.lastUpdate).toLocaleDateString("es-CO")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {workflowData.debtorProgress.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">No hay deudores en proceso</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Stage Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Actualizar Etapa</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Deudor: {selectedDebtor?.name}
            </Typography>

            <TextField
              select
              fullWidth
              label="Nueva Etapa"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              sx={{ mb: 2, mt: 2 }}
            >
              <MenuItem value="initial_contact">Contacto Inicial</MenuItem>
              <MenuItem value="follow_up">Seguimiento</MenuItem>
              <MenuItem value="negotiation">Negociación</MenuItem>
              <MenuItem value="payment_arrangement">Acuerdo de Pago</MenuItem>
              <MenuItem value="collection_complete">Completado</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateStage} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionDashboard;

