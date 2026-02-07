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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  WhatsApp,
  Phone,
  Email,
  SmartToy,
  Refresh,
  FileDownload,
} from "@mui/icons-material";
import { API_URL } from "../../constants/Constants";

interface CostSummary {
  total: number;
  byType: {
    whatsapp: number;
    sms: number;
    call: number;
    email: number;
    agent: number;
  };
  thisMonth: number;
  lastMonth: number;
  transactions: number;
  averagePerTransaction: number;
}

interface CostEntry {
  id: number;
  amount: string;
  type: string;
  createdAt: string;
  description: string;
}

const CostDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [history, setHistory] = useState<CostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [limit, setLimit] = useState(50);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        navigate("/");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch summary
      const summaryRes = await axios.get(`${API_URL}/api/costs/summary`, { headers });
      setSummary(summaryRes.data);

      // Fetch history
      const historyRes = await axios.get(
        `${API_URL}/api/costs/history?type=${filterType}&limit=${limit}`,
        { headers }
      );
      setHistory(historyRes.data.costs);

      setError("");
    } catch (err: any) {
      console.error("Error fetching cost data:", err);
      setError(err.response?.data?.error || "Error al cargar datos");
      if (err.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, limit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return <WhatsApp sx={{ color: "#25D366" }} />;
      case "sms":
        return <Email sx={{ color: "#1976d2" }} />;
      case "call":
        return <Phone sx={{ color: "#ff5722" }} />;
      case "email":
        return <Email sx={{ color: "#9c27b0" }} />;
      case "agent":
        return <SmartToy sx={{ color: "#ff9800" }} />;
      default:
        return <AttachMoney />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "whatsapp":
        return "#25D366";
      case "sms":
        return "#1976d2";
      case "call":
        return "#ff5722";
      case "email":
        return "#9c27b0";
      case "agent":
        return "#ff9800";
      default:
        return "#666";
    }
  };

  const calculateTrend = () => {
    if (!summary) return 0;
    if (summary.lastMonth === 0) return 100;
    return ((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100;
  };

  const exportToCSV = () => {
    if (history.length === 0) return;

    const csv = [
      ["Fecha", "Tipo", "Descripción", "Monto"],
      ...history.map((entry) => [
        new Date(entry.createdAt).toLocaleString("es-CO"),
        entry.type,
        entry.description,
        entry.amount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `costos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading && !summary) {
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
            💰 Panel de Costos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza y gestiona tus gastos operativos
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refrescar datos">
            <IconButton onClick={fetchData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar a CSV">
            <IconButton onClick={exportToCSV} color="primary">
              <FileDownload />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {summary && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Cost Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                    Gasto Total
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(summary.total)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {summary.transactions} transacciones
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* This Month Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                    Este Mes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(summary.thisMonth)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {calculateTrend() >= 0 ? (
                      <TrendingUp fontSize="small" />
                    ) : (
                      <TrendingDown fontSize="small" />
                    )}
                    <Typography variant="body2">
                      {Math.abs(calculateTrend()).toFixed(1)}% vs mes anterior
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Last Month Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ background: "#f5f5f5", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: "#666" }}>
                    Mes Anterior
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: "#333" }}>
                    {formatCurrency(summary.lastMonth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comparación
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Average Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                    Promedio
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(summary.averagePerTransaction)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Por transacción
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Cost by Type */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Costos por Tipo
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(summary.byType).map(([type, amount]) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={type}>
                    <Box
                      sx={{
                        p: 2,
                        border: "2px solid",
                        borderColor: getTypeColor(type),
                        borderRadius: 2,
                        textAlign: "center",
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box sx={{ mb: 1 }}>{getTypeIcon(type)}</Box>
                      <Typography
                        variant="caption"
                        sx={{ textTransform: "uppercase", color: "#666" }}
                      >
                        {type}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: getTypeColor(type) }}>
                        {formatCurrency(amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {((amount / summary.total) * 100).toFixed(1)}% del total
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardContent>
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  📋 Historial de Transacciones
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={filterType}
                      label="Tipo"
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="call">Llamadas</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="agent">Agentes</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Mostrar</InputLabel>
                    <Select
                      value={limit}
                      label="Mostrar"
                      onChange={(e) => setLimit(Number(e.target.value))}
                    >
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={500}>500</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Monto
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow
                        key={entry.id}
                        sx={{
                          "&:hover": { bgcolor: "#f9f9f9" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          {new Date(entry.createdAt).toLocaleString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getTypeIcon(entry.type)}
                            label={entry.type}
                            size="small"
                            sx={{
                              bgcolor: getTypeColor(entry.type) + "20",
                              color: getTypeColor(entry.type),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(Number(entry.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {history.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">No hay transacciones para mostrar</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default CostDashboard;

