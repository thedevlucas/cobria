// Dependencies
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  Avatar,
  Badge,
  Chip,
  Divider,
  Fab,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
// Icons
import SearchIcon from "@mui/icons-material/Search";
import Face2Icon from "@mui/icons-material/Face2";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import PhoneIcon from "@mui/icons-material/Phone";
import MessageIcon from "@mui/icons-material/Message";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
// Helpers
import {
  deleteTelephone,
  getCallChats,
  getTelephones,
} from "../../helpers/chat/CallChatHelper";
import { filterString } from "../../helpers/SearchFilter";
import { getAndTransformDebtors } from "../../helpers/chat/ModifyDebtor";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../../constants/Constants";
// Components
import MenuComponent from "../../components/menu/MenuComponent";
import EnhancedCreatePhone from "../../components/dialog/EnhancedCreatePhone";
// Styles
import {
  textFieldSearchChatStyle,
  iconChatStyle,
  listItemTextChatStyle,
  listHeaderChatStyle,
  listItemTitleChatStyle,
  gridContainerStyle,
} from "../../styles/ChatStyle";

// Debtor interface
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

export default function callChat() {
  const navigate = useNavigate();
  // Variables
  const [searchName, setSearchName] = useState<string>("");
  // Chat variables
  const [name, setName] = useState<string>("");
  const [telephone, setTelephone] = useState<number>(0);
  const [id, setId] = useState<number>(0);
  const [chats, setChats] = useState<Record<string, any>[]>([]);
  // Telephones
  const [telephones, setTelephones] = useState<Record<string, any>[]>([]);
  // New state for enhanced functionality
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showNewChat, setShowNewChat] = useState<boolean>(false);
  // Debtor state
  const [debtors, setDebtors] = useState<Debtor[]>([]);

  // Helper functions
  const loadContacts = async () => {
    setLoading(true);
    try {
      // Try to load debtors with cellphones first
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${API_URL}/api/cellphone`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Debtors with cellphones loaded:", response.data);
        
        // Transform the data to match our interface
        const transformedDebtors = response.data.map((debtor: any) => ({
          id: debtor.id,
          name: debtor.name,
          document: debtor.document || 'N/A',
          email: debtor.email || 'N/A',
          paid: debtor.paid || 'pending',
          cellphones: debtor.telephones || []
        }));
        
        setDebtors(transformedDebtors);
      } catch (cellphoneError) {
        console.log("Cellphone API failed, trying basic debtors");
        // Fallback to basic debtors
        const debtorsData = await getAndTransformDebtors();
        console.log("Debtors loaded:", debtorsData);
        setDebtors(debtorsData);
      }
      
      // Also try to load telephones for backward compatibility
      try {
        const telephoneData = await getTelephones(navigate);
        console.log("Telephones loaded:", telephoneData);
        setTelephones(telephoneData || []);
      } catch (telError) {
        console.log("No telephone data available, using debtors only");
        setTelephones([]);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (person: any, telephone: any) => {
    setName(person.name);
    setTelephone(telephone.to);
    setId(telephone.id);
    setSelectedContact({ person, telephone });
    setShowNewChat(false);
  };

  const handleStartNewChat = () => {
    // Navigate to main chat component instead of showing new chat state
    navigate('/chat');
  };

  const handleAddContactSuccess = () => {
    setShowAddContact(false);
    loadContacts(); // Reload contacts after adding new one
  };

  const handleDebtorSelect = (debtor: Debtor) => {
    setSelectedContact({ debtor });
    setShowNewChat(false);
    // If debtor has cellphones, show them for selection
    if (debtor.cellphones && debtor.cellphones.length > 0) {
      // For now, just select the first phone number
      const phoneNumber = debtor.cellphones[0].to;
      setName(debtor.name);
      setTelephone(phoneNumber);
      setId(debtor.cellphones[0].id);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    setTelephones(prev => filterString(prev, "name", searchName));
  }, [searchName]);

  useEffect(() => {
    setChats([]);
    if (id) {
      getCallChats(telephone, navigate).then((data) => {
        setChats(data || []);
      });
    }
  }, [telephone]);

  return (
    <div className="all">
      {MenuComponent()}
      <main>
        <Grid container style={gridContainerStyle} spacing={2}>
          {/* Left Sidebar - Contact List */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              {/* Header with New Chat Button */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    Deudores
                  </Typography>
                  <Box>
                    <Tooltip title="Agregar Contacto">
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
                        onClick={loadContacts}
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
                  label="Buscar deudor..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
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
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : debtors.length === 0 && telephones.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchName ? 'No se encontraron deudores' : 'No hay deudores disponibles'}
                    </Typography>
                    {!searchName && (
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
                    {/* Show debtors first */}
                    {debtors
                      .filter(debtor => 
                        !searchName || 
                        debtor.name.toLowerCase().includes(searchName.toLowerCase()) ||
                        debtor.document.includes(searchName)
                      )
                      .map((debtor) => (
                        <ListItem key={debtor.id} disablePadding>
                          <ListItemButton
                            selected={selectedContact?.debtor?.id === debtor.id}
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
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Doc: {debtor.document}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Estado: {debtor.paid}
                                  </Typography>
                                  {debtor.cellphones && debtor.cellphones.length > 0 && (
                                    <Chip
                                      label={`${debtor.cellphones.length} teléfono${debtor.cellphones.length > 1 ? 's' : ''}`}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ ml: 1, fontSize: '0.7rem' }}
                                    />
                                  )}
                                </Box>
                              }
                              primaryTypographyProps={{
                                variant: 'subtitle2',
                                fontWeight: selectedContact?.debtor?.id === debtor.id ? 'bold' : 'normal'
                              }}
                            />
                            <Chip
                              label="Chat"
                              size="small"
                              color="primary"
                              variant="outlined"
                              icon={<MessageIcon />}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    
                    {/* Show telephones if available */}
                    {telephones.map((person, index) => (
                      <Box key={`tel-${index}`}>
                        {person.telephones && person.telephones.map((telephone: Record<string, any>) => (
                          <ListItem key={telephone.id} disablePadding>
                            <ListItemButton
                              selected={selectedContact?.telephone?.id === telephone.id}
                              onClick={() => handleContactSelect(person, telephone)}
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
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                  <PhoneIcon fontSize="small" />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={person.name}
                                secondary={`+${telephone.to}`}
                                primaryTypographyProps={{
                                  variant: 'subtitle2',
                                  fontWeight: selectedContact?.telephone?.id === telephone.id ? 'bold' : 'normal'
                                }}
                                secondaryTypographyProps={{
                                  variant: 'caption',
                                  color: 'text.secondary'
                                }}
                              />
                              <Chip
                                label="Tel"
                                size="small"
                                color="secondary"
                                variant="outlined"
                                icon={<PhoneIcon />}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </Box>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Chat Area */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              {showNewChat ? (
                // New Chat State
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  p: 3
                }}>
                  <ChatIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Iniciar Nueva Conversación
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Selecciona un contacto de la lista para comenzar a chatear
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setShowAddContact(true)}
                    size="large"
                  >
                    Agregar Nuevo Contacto
                  </Button>
                </Box>
              ) : id === 0 ? (
                // No Contact Selected State
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  p: 3
                }}>
                  <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Selecciona un Contacto
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Elige un contacto de la lista para ver el historial de conversación
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
              ) : (
                // Active Chat State
                <>
                  {/* Chat Header */}
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Face2Icon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          +{telephone}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Llamar">
                        <IconButton color="success">
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Contacto">
                        <IconButton 
                          color="error"
                          onClick={() => deleteTelephone(id, setId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Chat Messages */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {chats.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Sin historial de chat
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Los mensajes aparecerán aquí cuando inicies una conversación
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        {chats.map((chat: Record<string, any>, index: number) => {
                          if (chat.message[0] === "{") {
                            return null;
                          }
                          const isFromDebtor = Number(chat.from_cellphone) === telephone;
                          return (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: isFromDebtor ? 'flex-start' : 'flex-end',
                                mb: 2
                              }}
                            >
                              <Paper
                                elevation={1}
                                sx={{
                                  p: 2,
                                  maxWidth: '70%',
                                  backgroundColor: isFromDebtor ? 'grey.100' : 'primary.main',
                                  color: isFromDebtor ? 'text.primary' : 'white'
                                }}
                              >
                                <Typography variant="body1">{chat.message}</Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    mt: 1,
                                    color: isFromDebtor ? 'text.secondary' : 'rgba(255,255,255,0.7)'
                                  }}
                                >
                                  {chat.createdAt}
                                </Typography>
                              </Paper>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Add Contact Dialog */}
        <Dialog 
          open={showAddContact} 
          onClose={() => setShowAddContact(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
          <DialogContent>
            <EnhancedCreatePhone onSuccess={handleAddContactSuccess} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
