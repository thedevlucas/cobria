import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  FileUpload as FileUploadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Components
import MenuComponent from '../../components/menu/MenuComponent';
import RealTimeDashboard from '../../components/dashboard/RealTimeDashboard';
import FileProcessingStatus from '../../components/dashboard/FileProcessingStatus';
import RealTimeNotifications from '../../components/notifications/RealTimeNotifications';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RealTimeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefreshAll = () => {
    // This would trigger a refresh of all components
    window.location.reload();
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando Dashboard en Tiempo Real...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
      <MenuComponent />
      <Container maxWidth="xl" sx={{ py: 0 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Dashboard en Tiempo Real
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitoreo en vivo de la plataforma de cobranza
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualizar todo">
                <Fab
                  color="primary"
                  size="medium"
                  onClick={handleRefreshAll}
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
              <Tooltip title="Configuración">
                <Fab
                  color="secondary"
                  size="medium"
                  onClick={() => navigate('/settings')}
                >
                  <SettingsIcon />
                </Fab>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<DashboardIcon />}
              label="Dashboard Principal"
              id="dashboard-tab-0"
              aria-controls="dashboard-tabpanel-0"
            />
            <Tab
              icon={<FileUploadIcon />}
              label="Procesamiento de Archivos"
              id="dashboard-tab-1"
              aria-controls="dashboard-tabpanel-1"
            />
            <Tab
              icon={<NotificationsIcon />}
              label="Notificaciones"
              id="dashboard-tab-2"
              aria-controls="dashboard-tabpanel-2"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <RealTimeDashboard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FileProcessingStatus />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RealTimeNotifications />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Acciones Rápidas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/upload-excel')}
              >
                <FileUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Subir Archivo</Typography>
                <Typography variant="body2" color="text.secondary">
                  Procesar nuevos deudores
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/debtor')}
              >
                <DashboardIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Ver Deudores</Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestionar deudores
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/chat')}
              >
                <NotificationsIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Chats</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ver conversaciones
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/report')}
              >
                <DashboardIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Reportes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ver estadísticas
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default RealTimeDashboardPage;
