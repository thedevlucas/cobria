// Enhanced Chat - Senior Developer Implementation
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Button,
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
  Message as MessageIcon,
  PersonAdd as PersonAddIcon,
  Face2 as Face2Icon
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';
import MenuComponent from '../../components/menu/MenuComponent';
import QuickAddPhone from '../../components/chat/QuickAddPhone';
import EnhancedCreatePhone from '../../components/dialog/EnhancedCreatePhone';
import { getAndTransformDebtors } from '../../helpers/chat/ModifyDebtor';
import { jwtDecode } from "jwt-decode";

// Enhanced Chat Interfaces
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
}

interface ChatStatistics {
  totalMessages: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  activeConversations: number;
  pendingMessages: number;
}

interface Debtor {
  id: number;
  name: string;
  document: string;
  email: string;
  paid: string;
  cellphones?: Array<{
    id: number;
    from: number;
    to: number;
  }>;
}

// Enhanced Chat Component
const Chat: React.FC = () => {
  // State management
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statistics, setStatistics] = useState<ChatStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for debtor contacts
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial data
  useEffect(() => {
    loadStatistics();
    loadDebtorsWithCellphones();
  }, []);

  // Load conversations when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadChatHistory(selectedConversation.phone_number);
    }
  }, [selectedConversation]);

  // API Functions
  const loadDebtorsWithCellphones = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      const response = await axios.get(`${API_URL}/api/cellphone/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDebtors(response.data);
      
      if (response.data.length > 0 && !selectedDebtor) {
        //temp auto select logic
      }

    } catch (error) {
      console.error("Error loading debtors with cellphones:", error);
    } finally {
      setLoading(false);
    }
  };



  const loadChatHistory = async (phoneNumber: number) => {
    try {
      setLoading(true);
      console.log('Loading chat history for phone number:', phoneNumber);
      
      // If it's a virtual conversation (phone number 0), don't try to load from API
      if (phoneNumber === 0) {
        console.log('Virtual conversation, starting with empty messages');
        setMessages([]);
        setLoading(false);
        return;
      }
      
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/enhanced-chat/chats/${phoneNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Chat history response:', response.data);
      setMessages(response.data.data || []);
    } catch (err: any) {
      console.log('No chat history available, starting new conversation');
      // If no chat history exists, start with empty messages for new conversation
      setMessages([]);
      setError(null); // Clear any previous errors
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
        { message: newMessage, message_type: 'text' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      // Reload messages
      loadChatHistory(selectedConversation.phone_number);
    } catch (err: any) {
      setError('Error al enviar mensaje');
      console.error('Error sending message:', err);
    }
  };


  // New helper functions for debtor contacts
  const handleStartNewChat = () => {
    setShowNewChat(true);
    setSelectedConversation(null);
    setSelectedDebtor(null);
    setMessages([]);
  };

  const handleDebtorSelect = (debtor: Debtor) => {
    console.log('Debtor selected:', debtor);
    setSelectedDebtor(debtor);
    setShowNewChat(false);
    // If debtor has cellphones, show them for selection
    if (debtor.cellphones && debtor.cellphones.length > 0) {
      // For now, just select the first phone number
      const phoneNumber = debtor.cellphones[0].to;
      console.log('Phone number selected:', phoneNumber);
      const conversation: Conversation = {
        phone_number: phoneNumber,
        debtor_name: debtor.name,
        latest_message: 'Nueva conversación',
        latest_timestamp: new Date(),
        message_count: 0,
        unread_count: 0
      };
      console.log('Setting conversation:', conversation);
      setSelectedConversation(conversation);
    } else {
      console.log('No cellphones available for this debtor, creating virtual conversation');
      // Create a virtual conversation even without cellphones
      const conversation: Conversation = {
        phone_number: 0, // Virtual phone number
        debtor_name: debtor.name,
        latest_message: 'Nueva conversación - Sin teléfono',
        latest_timestamp: new Date(),
        message_count: 0,
        unread_count: 0
      };
      console.log('Setting virtual conversation:', conversation);
      setSelectedConversation(conversation);
    }
  };

  const handleAddContactSuccess = () => {
    setShowAddContact(false);
    loadDebtorsWithCellphones(); // Reload debtors after adding new one
  };

  // Event handlers
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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MenuComponent />
      
      {/* Header with Statistics */}
      {statistics && (
        <Paper sx={{ p: 2, mb: 2, flexShrink: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {statistics.totalMessages}
                  </Typography>
                  <Typography variant="body2">Mensajes Enviados</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    ${statistics.totalCost.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Costo Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {statistics.successRate}%
                  </Typography>
                  <Typography variant="body2">Tasa de Éxito</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {statistics.activeConversations}
                  </Typography>
                  <Typography variant="body2">Conversaciones Activas</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden', minHeight: 0, pb: 1, px: 2 }}>
        {/* Enhanced Contact List with Debtors */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header with Action Buttons */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Contactos (Deudores)
                </Typography>
                <Box>
                  <Tooltip title="Agregar Deudor">
                    <IconButton 
                      onClick={() => setShowAddContact(true)}
                      color="primary"
                      size="small"
                    >
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Nuevo Chat">
                    <IconButton 
                      onClick={handleStartNewChat}
                      color="secondary"
                      size="small"
                    >
                      <ChatIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Actualizar">
                    <IconButton 
                      onClick={loadDebtorsWithCellphones}
                      size="small"
                      disabled={loading}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Search Field */}
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar deudor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Contact List */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : debtors.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'No se encontraron deudores' : 'No hay deudores disponibles'}
                  </Typography>
                  {!searchQuery && (
                    <Button
                      startIcon={<PersonAddIcon />}
                      onClick={() => setShowAddContact(true)}
                      sx={{ mt: 2 }}
                      variant="outlined"
                      size="small"
                    >
                      Agregar Primer Deudor
                    </Button>
                  )}
                </Box>
              ) : (
                <List>
                  {debtors
                    .filter(debtor => 
                      !searchQuery || 
                      debtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      debtor.document.includes(searchQuery)
                    )
                    .map((debtor) => (
                      <ListItem key={debtor.id} disablePadding>
                        <ListItemButton
                          selected={selectedDebtor?.id === debtor.id}
                          onClick={() => handleDebtorSelect(debtor)}
                          sx={{
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                              },
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <Face2Icon fontSize="small" />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={debtor.name}
                            secondary={`Doc: ${debtor.document} | Estado: ${debtor.paid}`}
                            primaryTypographyProps={{
                              variant: 'subtitle2',
                              fontWeight: selectedDebtor?.id === debtor.id ? 'bold' : 'normal'
                            }}
                          />
                          {debtor.cellphones && debtor.cellphones.length > 0 && (
                            <Chip
                              label={`${debtor.cellphones.length} teléfono${debtor.cellphones.length > 1 ? 's' : ''}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ ml: 1, fontSize: '0.7rem' }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {showNewChat ? (
              // New Chat State
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3,
                overflowY: 'auto'
              }}>
                <ChatIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Iniciar Nueva Conversación
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Selecciona un deudor de la lista para comenzar a chatear
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowAddContact(true)}
                  size="large"
                >
                  Agregar Nuevo Deudor
                </Button>
              </Box>
            ) : selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedConversation.debtor_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedConversation.phone_number === 0 
                          ? 'Sin teléfono registrado' 
                          : `+${selectedConversation.phone_number}`
                        }
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton onClick={() => loadChatHistory(selectedConversation.phone_number)}>
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Messages */}
                <Box 
                  sx={{ 
                    flex: 1, 
                    overflowY: 'auto', // Forzar scroll vertical
                    overflowX: 'hidden', // Evitar scroll horizontal
                    p: 2,
                    display: 'flex', // Asegura que el contenido se comporte bien
                    flexDirection: 'column'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: message.is_from_debtor ? 'flex-start' : 'flex-end',
                            mb: 2
                          }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              maxWidth: '70%',
                              bgcolor: message.is_from_debtor ? 'grey.100' : 'primary.main',
                              color: message.is_from_debtor ? 'text.primary' : 'white'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getMessageTypeIcon(message.message_type)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {message.from_debtor_name || message.to_debtor_name}
                              </Typography>
                            </Box>
                            <Typography variant="body1">{message.message}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {formatTimestamp(message.timestamp)}
                            </Typography>
                            {message.cost && (
                              <Chip
                                label={`$${message.cost.toFixed(4)}`}
                                size="small"
                                sx={{ ml: 1, fontSize: '0.7rem' }}
                              />
                            )}
                          </Paper>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => fileInputRef.current?.click()}>
                      <AttachFileIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="Escribe un mensaje..."
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
                  <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Selecciona un Deudor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Elige un deudor de la lista para ver el historial de conversación o iniciar un nuevo chat
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<ChatIcon />}
                    onClick={handleStartNewChat}
                    size="large"
                  >
                    Iniciar Nuevo Chat
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
          {error}
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
      />

      {/* Quick Add Phone Component */}
      <QuickAddPhone 
        onPhoneCreated={() => {
          // Refresh debtors when a new phone is created
          loadDebtorsWithCellphones();
        }}
      />

      {/* Add Contact Dialog */}
      <EnhancedCreatePhone 
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSuccess={handleAddContactSuccess}
      />
    </Box>
  );
};

export default Chat;