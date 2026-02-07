import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
}

interface RealTimeNotificationsProps {
  maxNotifications?: number;
  refreshInterval?: number;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ 
  maxNotifications = 10,
  refreshInterval = 5000 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = Cookies.get('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Fetch notifications from backend API
      const response = await axios.get(`${API_URL}/api/dashboard/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: maxNotifications }
      });

      setNotifications(response.data);

    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up auto-refresh
    const interval = setInterval(fetchNotifications, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, maxNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6">
              Notificaciones en Tiempo Real
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Actualizar notificaciones">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Limpiar todas">
              <IconButton onClick={clearAllNotifications}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Typography color="text.secondary">
            No hay notificaciones
          </Typography>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="body1" 
                        fontWeight={notification.read ? 'normal' : 'bold'}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type.toUpperCase()}
                        color={getNotificationColor(notification.type) as any}
                        size="small"
                      />
                      {!notification.read && (
                        <Chip
                          label="NUEVO"
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp}
                      </Typography>
                    </Box>
                  }
                />
                <Box display="flex" gap={1}>
                  {!notification.read && (
                    <Tooltip title="Marcar como leído">
                      <IconButton 
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Eliminar">
                    <IconButton 
                      size="small"
                      onClick={() => clearNotification(notification.id)}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message=""
      />
    </Card>
  );
};

export default RealTimeNotifications;
