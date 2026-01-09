import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  WhatsApp as WhatsAppIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';

interface ProcessingStatus {
  id: string;
  fileName: string;
  type: 'whatsapp' | 'sms' | 'email' | 'call';
  status: 'processing' | 'completed' | 'error' | 'pending';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  startTime: string;
  endTime?: string;
  errors?: string[];
}

interface FileProcessingStatusProps {
  refreshInterval?: number;
}

const FileProcessingStatus: React.FC<FileProcessingStatusProps> = ({ 
  refreshInterval = 10000 
}) => {
  const [processingFiles, setProcessingFiles] = useState<ProcessingStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessingStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = Cookies.get('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Fetch processing status from backend API
      const response = await axios.get(`${API_URL}/api/dashboard/processing`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProcessingFiles(response.data);

    } catch (err: any) {
      console.error('Error fetching processing status:', err);
      setError(err.response?.data?.message || 'Error al cargar estado de procesamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProcessingStatus();
  };

  useEffect(() => {
    fetchProcessingStatus();
    
    // Set up auto-refresh
    const interval = setInterval(fetchProcessingStatus, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <WhatsAppIcon color="success" />;
      case 'sms':
        return <MessageIcon color="primary" />;
      case 'email':
        return <EmailIcon color="info" />;
      case 'call':
        return <PhoneIcon color="secondary" />;
      default:
        return <UploadIcon />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'processing':
        return <ScheduleIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="info" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Estado de Procesamiento de Archivos
          </Typography>
          <Tooltip title="Actualizar estado">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {processingFiles.length === 0 ? (
          <Box textAlign="center" py={4}>
            <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay archivos siendo procesados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los archivos subidos aparecerán aquí con su estado de procesamiento
            </Typography>
          </Box>
        ) : (
          <List>
            {processingFiles.map((file, index) => (
              <React.Fragment key={file.id}>
                <ListItem>
                  <ListItemIcon>
                    {getTypeIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight="medium">
                          {file.fileName}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(file.status)}
                          label={getStatusText(file.status)}
                          color={getStatusColor(file.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tipo: {file.type.toUpperCase()} | 
                          Registros: {file.processedRecords}/{file.totalRecords} | 
                          Éxito: {file.successCount} | 
                          Errores: {file.errorCount}
                        </Typography>
                        
                        {file.status === 'processing' && (
                          <Box mt={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={file.progress} 
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {file.progress}% completado
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                          Inicio: {file.startTime}
                          {file.endTime && ` | Fin: ${file.endTime}`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < processingFiles.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default FileProcessingStatus;
