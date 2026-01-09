import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';

interface DashboardStats {
  totalDebtors: number;
  messagesSent: number;
  pendingMessages: number;
  totalCost: number;
  successRate: number;
  lastUpdate: string;
}

interface RecentActivity {
  id: string;
  type: 'whatsapp' | 'sms' | 'email' | 'call';
  debtorName: string;
  phoneNumber: string;
  status: 'sent' | 'pending' | 'error';
  timestamp: string;
  cost?: number;
}

interface RealTimeDashboardProps {
  refreshInterval?: number;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ 
  refreshInterval = 30000 
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = Cookies.get('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Fetch dashboard data from new API endpoints
      const [statsResponse, activityResponse] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/dashboard/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Use data from API responses
      setStats(statsResponse.data);

      // Use activity data from API response
      setRecentActivity(activityResponse.data);

      setLastRefresh(new Date());

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh
    const interval = setInterval(fetchDashboardData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'pending':
        return <ScheduleIcon color="warning" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return <WarningIcon color="warning" fontSize="small" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <WhatsAppIcon color="success" fontSize="small" />;
      case 'sms':
        return <MessageIcon color="primary" fontSize="small" />;
      case 'email':
        return <EmailIcon color="info" fontSize="small" />;
      case 'call':
        return <PhoneIcon color="secondary" fontSize="small" />;
      default:
        return <MessageIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando datos del dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard en Tiempo Real
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Última actualización: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Deudores</Typography>
                </Box>
                <Typography variant="h3" color="primary">
                  {stats.totalDebtors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <MessageIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Mensajes Enviados</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {stats.messagesSent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Pendientes</Typography>
                </Box>
                <Typography variant="h3" color="warning.main">
                  {stats.pendingMessages}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Costo Total</Typography>
                </Box>
                <Typography variant="h3" color="info.main">
                  ${stats.totalCost.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Success Rate */}
      {stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tasa de Éxito
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <LinearProgress 
                variant="determinate" 
                value={stats.successRate} 
                sx={{ flexGrow: 1, mr: 2 }}
              />
              <Typography variant="body1">
                {stats.successRate.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actividad Reciente
          </Typography>
          {recentActivity.length === 0 ? (
            <Typography color="text.secondary">
              No hay actividad reciente
            </Typography>
          ) : (
            <Box>
              {recentActivity.map((activity) => (
                <Box 
                  key={activity.id}
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  p={2}
                  borderBottom="1px solid"
                  borderColor="divider"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {getTypeIcon(activity.type)}
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {activity.debtorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.phoneNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      icon={getStatusIcon(activity.status)}
                      label={activity.status.toUpperCase()}
                      color={getStatusColor(activity.status) as any}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {activity.timestamp}
                    </Typography>
                    {activity.cost && (
                      <Typography variant="body2" color="success.main">
                        ${activity.cost.toFixed(3)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RealTimeDashboard;
