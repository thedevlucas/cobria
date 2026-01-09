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
  StepContent,
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
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Phone,
  Message,
  Email,
  CheckCircle,
  Warning,
  Error,
  Info,
  Timeline,
  Assessment,
  Group,
  Schedule
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
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [newStage, setNewStage] = useState<Partial<CollectionStage>>({});

  useEffect(() => {
    loadCollectionData();
  }, []);

  const loadCollectionData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      const [stagesResponse, debtorsResponse, statsResponse, campaignsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/collection/stages`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/collection/debtors`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/collection/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/collection/campaigns`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStages(stagesResponse.data.data || []);
      setDebtors(debtorsResponse.data.data || []);
      setStats(statsResponse.data.data);
      setCampaigns(campaignsResponse.data.data || []);
    } catch (err: any) {
      setError('Error al cargar datos de gestión de cobranzas');
      console.error('Error loading collection data:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveDebtorToStage = async (debtorId: number, newStage: string) => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/move-debtor`, {
        debtor_id: debtorId,
        new_stage: newStage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      loadCollectionData();
    } catch (err: any) {
      setError('Error al mover deudor a nueva etapa');
      console.error('Error moving debtor:', err);
    }
  };

  const createStage = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/collection/stages`, newStage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowStageDialog(false);
      setNewStage({});
      loadCollectionData();
    } catch (err: any) {
      setError('Error al crear etapa');
      console.error('Error creating stage:', err);
    }
  };

  const getStageColor = (stageName: string) => {
    const stage = stages.find(s => s.name === stageName);
    return stage?.color || 'default';
  };

  const getStageIcon = (stageName: string) => {
    const stage = stages.find(s => s.name === stageName);
    switch (stage?.icon) {
      case 'initial': return <Info />;
      case 'reminder': return <Message />;
      case 'urgent': return <Warning />;
      case 'final': return <Error />;
      case 'completed': return <CheckCircle />;
      default: return <Timeline />;
    }
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
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando gestión de cobranzas...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MenuComponent />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Cobranzas
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group color="primary" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Total Deudores
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {stats.total_debtors}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En gestión
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp color="success" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Tasa de Cobro
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {stats.collection_rate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Efectividad
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney color="info" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Total Cobrado
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    ${stats.total_collected.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Este período
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule color="warning" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Duración Promedio
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.average_stage_duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Días por etapa
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Collection Stages Visualization */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Etapas de Cobranza
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Timeline />}
                onClick={() => setShowStageDialog(true)}
              >
                Nueva Etapa
              </Button>
            </Box>

            <Stepper activeStep={-1} orientation="horizontal">
              {stages.map((stage, index) => (
                <Step key={stage.id}>
                  <StepLabel
                    icon={getStageIcon(stage.name)}
                    color={getStageColor(stage.name)}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {stage.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stage.debtor_count} deudores
                      </Typography>
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {stage.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stage.success_rate}
                        color={stage.success_rate > 70 ? 'success' : stage.success_rate > 40 ? 'warning' : 'error'}
                      />
                      <Typography variant="caption">
                        Tasa de éxito: {stage.success_rate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Campañas Activas
            </Typography>
            
            <Grid container spacing={2}>
              {campaigns.map((campaign) => (
                <Grid item xs={12} md={6} key={campaign.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">
                          {campaign.name}
                        </Typography>
                        <Chip
                          label={campaign.status}
                          color={campaign.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {campaign.debtor_count} deudores • {campaign.stages.length} etapas
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(campaign.collected_amount / campaign.target_amount) * 100}
                          color="primary"
                        />
                        <Typography variant="caption">
                          ${campaign.collected_amount.toFixed(2)} / ${campaign.target_amount.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Debtors Management */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Gestión de Deudores
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filtrar por Etapa</InputLabel>
                <Select
                  value={selectedStage}
                  label="Filtrar por Etapa"
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <MenuItem value="all">Todas las etapas</MenuItem>
                  {stages.map((stage) => (
                    <MenuItem key={stage.id} value={stage.name}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Deudor</TableCell>
                    <TableCell>Etapa Actual</TableCell>
                    <TableCell>Progreso</TableCell>
                    <TableCell>Probabilidad de Pago</TableCell>
                    <TableCell>Días en Etapa</TableCell>
                    <TableCell>Próxima Acción</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDebtors.map((debtor) => (
                    <TableRow key={debtor.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {debtor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {debtor.document}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStageIcon(debtor.current_stage)}
                          label={debtor.current_stage}
                          color={getStageColor(debtor.current_stage) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={debtor.stage_progress}
                            color={debtor.stage_progress > 70 ? 'success' : debtor.stage_progress > 40 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption">
                            {debtor.stage_progress.toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {(debtor.payment_probability * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {debtor.days_in_stage} días
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {debtor.next_action}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Mover a siguiente etapa">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const currentIndex = stages.findIndex(s => s.name === debtor.current_stage);
                              const nextStage = stages[currentIndex + 1];
                              if (nextStage) {
                                moveDebtorToStage(debtor.id, nextStage.name);
                              }
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

        {/* Create Stage Dialog */}
        <Dialog open={showStageDialog} onClose={() => setShowStageDialog(false)}>
          <DialogTitle>Crear Nueva Etapa</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de la Etapa"
              fullWidth
              variant="outlined"
              value={newStage.name || ''}
              onChange={(e) => setNewStage({...newStage, name: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newStage.description || ''}
              onChange={(e) => setNewStage({...newStage, description: e.target.value})}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Color</InputLabel>
              <Select
                value={newStage.color || ''}
                label="Color"
                onChange={(e) => setNewStage({...newStage, color: e.target.value})}
              >
                <MenuItem value="primary">Azul</MenuItem>
                <MenuItem value="secondary">Gris</MenuItem>
                <MenuItem value="success">Verde</MenuItem>
                <MenuItem value="warning">Amarillo</MenuItem>
                <MenuItem value="error">Rojo</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowStageDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createStage} variant="contained">
              Crear Etapa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CollectionManagementPage;


