// Enhanced Chat Component - Senior Developer Implementation
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';

interface ChatMessage {
  id: string;
  message: string;
  from_cellphone: number;
  to_cellphone: number;
  from_debtor_name?: string;
  to_debtor_name?: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  cost?: number;
  is_from_debtor: boolean;
  media_url?: string;
  media_type?: string;
}

interface Conversation {
  phone_number: number;
  debtor_name: string;
  latest_message: string;
  latest_timestamp: Date;
  message_count: number;
  unread_count: number;
  channel?: 'whatsapp' | 'sms';
}

interface ChatStatistics {
  totalMessages: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  activeConversations: number;
  pendingMessages: number;
}

const EnhancedChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statistics, setStatistics] = useState<ChatStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ESTADO DEL CANAL AÑADIDO Y POR DEFECTO EN SMS
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms'>('sms');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
    loadStatistics();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadChatHistory(selectedConversation.phone_number);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/enhanced-chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.data);
    } catch (err: any) {
      console.error('Error al cargar conversaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (phoneNumber: number) => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/enhanced-chat/chats/${phoneNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data);
    } catch (err: any) {
      console.error('Error al cargar historial del chat:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = Cookies.get('token');
      await axios.post(
        `${API_URL}/api/enhanced-chat/chats/${selectedConversation.phone_number}/send`,
        { 
          message: newMessage, 
          type: 'text',
          channel: selectedChannel // ENVIAMOS EL CANAL AL BACKEND
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      loadChatHistory(selectedConversation.phone_number);
      loadConversations();
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/enhanced-chat/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data);
    } catch (err: any) {
      console.error('Error al buscar mensajes:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (phoneNumber: number) => {
    try {
      const token = Cookies.get('token');
      await axios.put(
        `${API_URL}/api/enhanced-chat/chats/${phoneNumber}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadConversations();
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoCallIcon />;
      case 'audio': return <PhoneIcon />;
      default: return <MessageIcon />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {statistics && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Card><CardContent><Typography variant="h6" color="primary">{statistics.totalMessages}</Typography><Typography variant="body2">Mensajes Enviados</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card><CardContent><Typography variant="h6" color="success.main">${statistics.totalCost.toFixed(2)}</Typography><Typography variant="body2">Costo Total</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card><CardContent><Typography variant="h6" color="info.main">{statistics.successRate}%</Typography><Typography variant="body2">Tasa de Éxito</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card><CardContent><Typography variant="h6" color="warning.main">{statistics.activeConversations}</Typography><Typography variant="body2">Conversaciones Activas</Typography></CardContent></Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  endAdornment: searchQuery && (
                    <InputAdornment position="end"><IconButton onClick={searchMessages} size="small"><SearchIcon /></IconButton></InputAdornment>
                  )
                }}
              />
            </Box>
            
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation.phone_number}
                  button
                  selected={selectedConversation?.phone_number === conversation.phone_number}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    // LEE EL CANAL O PONE SMS POR DEFECTO
                    setSelectedChannel(conversation.channel || 'sms');
                    markAsRead(conversation.phone_number);
                  }}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={conversation.unread_count} color="error" invisible={conversation.unread_count === 0}>
                      <Avatar><PersonIcon /></Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.debtor_name}
                    secondary={
                      <Box>
                        <Typography variant="body2" noWrap>{conversation.latest_message}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatTimestamp(conversation.latest_timestamp)}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}><PersonIcon /></Avatar>
                    <Box>
                      <Typography variant="h6">{selectedConversation.debtor_name}</Typography>
                      <Typography variant="body2" color="text.secondary">+{selectedConversation.phone_number}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton onClick={() => loadChatHistory(selectedConversation.phone_number)}><RefreshIcon /></IconButton>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <Box key={message.id} sx={{ display: 'flex', justifyContent: message.is_from_debtor ? 'flex-start' : 'flex-end', mb: 2 }}>
                          <Paper sx={{ p: 2, maxWidth: '70%', bgcolor: message.is_from_debtor ? 'grey.100' : 'primary.main', color: message.is_from_debtor ? 'text.primary' : 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getMessageTypeIcon(message.message_type)}
                              <Typography variant="body2" sx={{ ml: 1 }}>{message.from_debtor_name || message.to_debtor_name}</Typography>
                            </Box>
                            <Typography variant="body1">{message.message}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>{formatTimestamp(message.timestamp)}</Typography>
                          </Paper>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    
                    {/* SELECTOR WA / SMS */}
                    <ToggleButtonGroup
                      value={selectedChannel}
                      exclusive
                      onChange={(_e, newChannel) => { if (newChannel) setSelectedChannel(newChannel); }}
                      size="small"
                      sx={{ mr: 1, height: '40px' }}
                    >
                      <ToggleButton value="whatsapp" sx={{ px: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>WA</ToggleButton>
                      <ToggleButton value="sms" sx={{ px: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>SMS</ToggleButton>
                    </ToggleButtonGroup>

                    <IconButton onClick={() => fileInputRef.current?.click()}>
                      <AttachFileIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder={`Escribe un mensaje por ${selectedChannel.toUpperCase()}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                    />
                    <IconButton onClick={sendMessage} disabled={!newMessage.trim() || loading}>
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">Selecciona una conversación</Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedChatComponent;