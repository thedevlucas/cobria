// Enhanced Chat Page - Senior Developer Implementation
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { API_URL } from '../../constants/Constants';

// Components
import MenuComponent from '../../components/menu/MenuComponent';
import EnhancedChatComponent from '../../components/chat/EnhancedChatComponent';

// Enhanced Chat Interfaces
interface ChatStatistics {
  totalMessages: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  activeConversations: number;
  pendingMessages: number;
}

interface Conversation {
  phone_number: number;
  debtor_name: string;
  latest_message: string;
  latest_timestamp: Date;
  message_count: number;
  unread_count: number;
}

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
      id={`enhanced-chat-tabpanel-${index}`}
      aria-labelledby={`enhanced-chat-tab-${index}`}
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

const EnhancedChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ChatStatistics | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Load initial data
    loadStatistics();
    loadConversations();
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const loadStatistics = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/enhanced-chat/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data.data);
    } catch (err: any) {
      console.error('Error loading statistics:', err);
    }
  };

  const loadConversations = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/enhanced-chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.data);
    } catch (err: any) {
      console.error('Error loading conversations:', err);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    loadStatistics();
    loadConversations();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleExportConfirm = () => {
    // TODO: Implement export functionality
    console.log(`Exporting conversations in ${exportFormat} format`);
    setExportDialogOpen(false);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.debtor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.latest_message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'unread' && conv.unread_count > 0) ||
                         (filterStatus === 'recent' && new Date(conv.latest_timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000));
    return matchesSearch && matchesFilter;
  });

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
          Cargando Chat Mejorado...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
      <MenuComponent />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Chat Mejorado
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sistema de mensajería avanzado con análisis en tiempo real
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualizar datos">
                <Fab
                  color="primary"
                  size="medium"
                  onClick={handleRefresh}
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
              <Tooltip title="Opciones">
                <Fab
                  color="secondary"
                  size="medium"
                  onClick={handleMenuClick}
                >
                  <MoreVertIcon />
                </Fab>
              </Tooltip>
            </Box>
          </Box>
        </Paper>



        {/* Statistics Cards */}
        {statistics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="primary">
                        {statistics.totalMessages}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mensajes Enviados
                      </Typography>
                    </Box>
                    <ChatIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="success.main">
                        ${statistics.totalCost.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Costo Total
                      </Typography>
                    </Box>
                    <AnalyticsIcon color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {statistics.successRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasa de Éxito
                      </Typography>
                    </Box>
                    <AnalyticsIcon color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {statistics.activeConversations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Conversaciones Activas
                      </Typography>
                    </Box>
                    <ChatIcon color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="enhanced chat tabs"
            variant="fullWidth"
          >
            <Tab
              icon={<ChatIcon />}
              label="Chat Principal"
              id="enhanced-chat-tab-0"
              aria-controls="enhanced-chat-tabpanel-0"
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Análisis"
              id="enhanced-chat-tab-1"
              aria-controls="enhanced-chat-tabpanel-1"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Configuración"
              id="enhanced-chat-tab-2"
              aria-controls="enhanced-chat-tabpanel-2"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <EnhancedChatComponent />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Análisis de Conversaciones
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="unread">No leídas</MenuItem>
                    <MenuItem value="recent">Recientes</MenuItem>
                  </TextField>
                </Box>
                
                <Grid container spacing={2}>
                  {filteredConversations.map((conversation) => (
                    <Grid item xs={12} sm={6} md={4} key={conversation.phone_number}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box>
                              <Typography variant="h6">
                                {conversation.debtor_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                +{conversation.phone_number}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {conversation.latest_message}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Chip
                                label={`${conversation.message_count} mensajes`}
                                size="small"
                                color="primary"
                              />
                              {conversation.unread_count > 0 && (
                                <Chip
                                  label={`${conversation.unread_count} no leídos`}
                                  size="small"
                                  color="error"
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Configuración del Chat
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                  >
                    Exportar Conversaciones
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                  >
                    Importar Configuración
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ArchiveIcon />}
                  >
                    Archivar Conversaciones
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    color="error"
                  >
                    Limpiar Historial
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Exportar Conversaciones</DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Formato de exportación"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleExportConfirm} variant="contained">
              Exportar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleExport}>
            <DownloadIcon sx={{ mr: 1 }} />
            Exportar
          </MenuItem>
          <MenuItem onClick={handleRefresh}>
            <RefreshIcon sx={{ mr: 1 }} />
            Actualizar
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>
            <SettingsIcon sx={{ mr: 1 }} />
            Configuración
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default EnhancedChatPage;


