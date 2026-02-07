// Collection Management Dashboard - Senior Full Stack Developer Implementation
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Info,
  Timeline,
  Group,
  Schedule,
  Delete,
  Add,
  Payments // Nuevo icono para pagos
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';
import MenuComponent from '../../components/menu/MenuComponent';

interface CollectionStage {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
  icon: string;
  is_active: boolean;
  debtor_count: number;
  success_rate: number;
  average_duration: number;
}

interface DebtorProgress {
  id: number;
  name: string;
  document: string;
  id_campaign?: number; 
  current_stage: string;
  stage_progress: number;
  last_interaction: string;
  next_action: string;
  payment_probability: number;
  days_in_stage: number;
  total_debt: number;
  contact_info: {
    phone: string;
    email: string;
  };
}

interface CollectionStats {
  total_debtors: number;
  active_campaigns: number;
  total_collected: number;
  collection_rate: number;
  average_stage_duration: number;
  stage_distribution: {
    [key: string]: number;
  };
  performance_metrics: {
    response_rate: number;
    payment_rate: number;
    escalation_rate: number;
  };
}

interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  start_date: string;
  end_date?: string;
  debtor_count: number;
  collected_amount: number;
  target_amount: number;
  stages: CollectionStage[];
}

const CollectionManagementPage: React.FC = () => {
  const [stages, setStages] = useState<CollectionStage[]>([]);
  const [debtors, setDebtors] = useState<DebtorProgress[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  // Estados para Diálogos
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Estados para nuevos registros
  const [newStage, setNewStage] = useState<Partial<CollectionStage>>({});
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({ name: '', target_amount: 0 });
  const [paymentData, setPaymentData] = useState({ 
    debtor_id: 0, 
    amount: 0, 
    debtor_name: '',
    type: 'agent'
  });

  useEffect(() => {
    loadCollectionData();
  }, []);

  const loadCollectionData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [stagesResponse, debtorsResponse, statsResponse, campaignsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/collection/stages`, { headers }),
        axios.get(`${API_URL}/api/collection/debtors`, { headers }),
        axios.get(`${API_URL}/api/collection/stats`, { headers }),
        axios.get(`${API_URL}/api/collection/campaigns`, { headers })
      ]);

      setStages(stagesResponse.data.data || []);
      setDebtors(debtorsResponse.data.data || []);
      setStats(statsResponse.data.data);
      setCampaigns(campaignsResponse.data.data || []);
    } catch (err: any) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/register-payment`, {
        debtor_id: paymentData.debtor_id,
        amount: paymentData.amount,
        type: paymentData.type // <--- Enviamos el tipo seleccionado
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowPaymentDialog(false);
      loadCollectionData();
    } catch (err) { setError('Error al registrar el pago'); }
  };

  const moveDebtorToStage = async (debtorId: number, nextStageId: string) => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/move-debtor`, {
        debtor_id: debtorId,
        new_stage_id: nextStageId 
      }, { headers: { Authorization: `Bearer ${token}` } });
      loadCollectionData();
    } catch (err: any) { setError('Error al mover deudor'); }
  };

  const deleteStage = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta etapa?')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(`${API_URL}/api/collection/stages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadCollectionData();
    } catch (err: any) { setError('Error al eliminar etapa'); }
  };

  const deleteCampaign = async (id: number) => {
    if (!window.confirm('¿Borrar esta campaña? Los deudores quedarán sin campaña asignada.')) return;
    try {
      const token = Cookies.get('token');
      await axios.delete(`${API_URL}/api/collection/campaigns/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadCollectionData();
    } catch (err) { setError('Error al borrar campaña'); }
  };

  const handleAssignCampaign = async (debtorId: number, campaignId: any) => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/update-debtor-campaign`, {
        debtor_id: debtorId,
        campaign_id: campaignId === 'none' ? null : campaignId
      }, { headers: { Authorization: `Bearer ${token}` } });
      loadCollectionData();
    } catch (err) { setError('Error al asignar campaña'); }
  };

  const createStage = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/stages`, newStage, { headers: { Authorization: `Bearer ${token}` } });
      setShowStageDialog(false);
      setNewStage({});
      loadCollectionData();
    } catch (err: any) { setError('Error al crear etapa'); }
  };

  const createCampaign = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/campaigns`, newCampaign, { headers: { Authorization: `Bearer ${token}` } });
      setShowCampaignDialog(false);
      setNewCampaign({ name: '', target_amount: 0 });
      loadCollectionData();
    } catch (err: any) { setError('Error al crear campaña'); }
  };

  const getStageIcon = (stageName: string) => {
    const n = stageName.toLowerCase().trim();
    if (n === 'inicio') return <Info color="info" />;
    if (n === 'completado') return <CheckCircle color="success" />;
    return <Timeline />;
  };

  const filteredDebtors = debtors.filter(debtor => 
    selectedStage === 'all' || debtor.current_stage === selectedStage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <MenuComponent />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Cargando...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MenuComponent />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" gutterBottom>Gestión de Cobranzas</Typography>
          <Box>
            <Button variant="contained" color="success" startIcon={<Add />} onClick={() => setShowCampaignDialog(true)} sx={{ mr: 1 }}>
              Nueva Campaña
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setShowStageDialog(true)}>
              Nueva Etapa
            </Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: '5px solid #1976d2' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group color="primary" />
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>Total Deudores</Typography>
                  </Box>
                  <Typography variant="h4">{stats.total_debtors}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: '5px solid #2e7d32' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp color="success" />
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>Tasa de Cobro</Typography>
                  </Box>
                  <Typography variant="h4">{(stats.collection_rate ?? 0).toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: '5px solid #0288d1' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney color="info" />
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>Total Cobrado</Typography>
                  </Box>
                  <Typography variant="h4">${(stats.total_collected ?? 0).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: '5px solid #ed6c02' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule color="warning" />
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>Duración Promedio</Typography>
                  </Box>
                  <Typography variant="h4">{stats.average_stage_duration} días</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Stepper */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Etapas de Cobranza</Typography>
            <Stepper activeStep={-1} orientation="horizontal" alternativeLabel>
              {stages.map((stage) => (
                <Step key={stage.id}>
                  <StepLabel icon={getStageIcon(stage.name)}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">{stage.name}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: 120, margin: '0 auto' }}>
                        {stage.description || 'Sin descripción'}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="primary">{stage.debtor_count} deudores</Typography>
                        {stage.name.toLowerCase() !== 'inicio' && stage.name.toLowerCase() !== 'completado' && (
                          <IconButton size="small" color="error" onClick={() => deleteStage(stage.id)} sx={{ ml: 0.5 }}>
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Campañas Activas */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Campañas Activas</Typography>
            <Grid container spacing={2}>
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <Grid item xs={12} md={6} key={campaign.id}>
                    <Card variant="outlined" sx={{ borderLeft: '5px solid #2e7d32', position: 'relative' }}>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => deleteCampaign(campaign.id)}
                        sx={{ position: 'absolute', top: 5, right: 5 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          {/* TITULO DE LA CAMPAÑA */}
                          <Typography variant="h6" fontWeight="bold" color="primary">{campaign.name}</Typography>
                         
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {campaign.debtor_count} deudores bajo gestión directa
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Progreso de Recaudo</Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {((campaign.collected_amount / (campaign.target_amount || 1)) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((campaign.collected_amount / (campaign.target_amount || 1)) * 100, 100)}
                          />
                          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                            Recaudado: <b>${campaign.collected_amount.toLocaleString()}</b> / Meta: ${campaign.target_amount.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    No hay campañas activas.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tabla de Deudores */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Gestión de Deudores</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filtrar por Etapa</InputLabel>
                <Select
                  value={selectedStage}
                  label="Filtrar por Etapa"
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <MenuItem value="all">Todas las etapas</MenuItem>
                  {stages.map((stage) => (
                    <MenuItem key={stage.id} value={stage.name}>{stage.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Deudor</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Etapa Actual</TableCell>
                    <TableCell>Días en Etapa</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDebtors.map((debtor) => (
                    <TableRow key={debtor.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{debtor.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{debtor.document}</Typography>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={debtor.id_campaign || 'none'}
                          onChange={(e) => handleAssignCampaign(debtor.id, e.target.value)}
                          sx={{ fontSize: '0.75rem', minWidth: 130 }}
                        >
                          <MenuItem value="none"><em>Sin Campaña</em></MenuItem>
                          {campaigns.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Chip label={debtor.current_stage} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{debtor.days_in_stage ?? 0} días</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Registrar Pago">
                          <IconButton size="small" color="success" onClick={() => {
                            setPaymentData({ debtor_id: debtor.id, amount: 0, debtor_name: debtor.name, type: 'agent' });
                            setShowPaymentDialog(true);
                          }}>
                            <Payments />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mover a siguiente etapa">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentIndex = stages.findIndex(s => s.name === debtor.current_stage);
                              const nextStage = stages[currentIndex + 1];
                              if (nextStage) moveDebtorToStage(debtor.id, nextStage.id);
                            }}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Diálogo Registrar Pago */}
        <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Registrar Pago - {paymentData.debtor_name}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus margin="dense" label="Monto ($)" type="number" fullWidth variant="outlined"
              onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
              sx={{ mb: 2, mt: 1 }}
            />

            {/* NUEVO: Selector de Tipo basado en tu ENUM */}
            <FormControl fullWidth>
              <InputLabel>Canal de Recaudo</InputLabel>
              <Select
                value={paymentData.type}
                label="Canal de Recaudo"
                onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
              >
                <MenuItem value="agent">Agente (Manual)</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="call">Llamada</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
            <Button variant="contained" color="success" onClick={handleRegisterPayment}>Confirmar</Button>
          </DialogActions>
        </Dialog>

        {/* Resto de Diálogos (Campaña y Etapa) */}
        <Dialog open={showCampaignDialog} onClose={() => setShowCampaignDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Crear Nueva Campaña</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Nombre" fullWidth variant="outlined" onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} sx={{ mb: 2, mt: 1 }} />
            <TextField margin="dense" label="Meta ($)" type="number" fullWidth variant="outlined" onChange={(e) => setNewCampaign({...newCampaign, target_amount: Number(e.target.value)})} />
          </DialogContent>
          <DialogActions><Button onClick={() => setShowCampaignDialog(false)}>Cancelar</Button><Button variant="contained" color="success" onClick={createCampaign}>Crear</Button></DialogActions>
        </Dialog>

        <Dialog open={showStageDialog} onClose={() => setShowStageDialog(false)}>
          <DialogTitle>Crear Nueva Etapa</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Nombre" fullWidth variant="outlined" onChange={(e) => setNewStage({...newStage, name: e.target.value})} sx={{ mb: 2, mt: 1 }} />
            <TextField margin="dense" label="Descripción" fullWidth multiline rows={3} variant="outlined" onChange={(e) => setNewStage({...newStage, description: e.target.value})} />
          </DialogContent>
          <DialogActions><Button onClick={() => setShowStageDialog(false)}>Cancelar</Button><Button onClick={createStage} variant="contained">Crear</Button></DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CollectionManagementPage;