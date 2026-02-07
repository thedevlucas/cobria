// AI Feedback System - Senior Full Stack Developer Implementation
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  SmartToy,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Psychology,
  Assessment,
  ThumbUp,
  ThumbDown,
  Send,
  ExpandMore,
  Refresh,
  AutoFixHigh,
  Insights
} from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../../constants/Constants';

interface AIFeedback {
  suggested_message: string;
  collection_strategy: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  next_action: string;
  payment_probability: number;
  personalized_approach: string;
  risk_assessment: string;
  legal_recommendations?: string;
  follow_up_schedule?: { // Marcado como opcional (?) para evitar errores de tipo
    next_contact: string;
    method: 'whatsapp' | 'sms' | 'call' | 'email';
    timing: string;
  };
}

interface FeedbackSubmission {
  debtor_id: number;
  message_sent: string;
  debtor_response?: string;
  outcome: 'payment_made' | 'payment_promised' | 'no_response' | 'negative_response' | 'escalation_needed';
  effectiveness_score: number;
  feedback_notes?: string;
}

interface AIInsights {
  debtor_behavior_pattern: string;
  best_contact_time: string;
  preferred_communication: string;
  payment_triggers: string[];
  risk_factors: string[];
  success_probability: number;
  recommended_approach: string;
}

interface Props {
  debtorId: number;
  currentMessage?: string;
  onMessageGenerated: (message: string) => void;
  onFeedbackSubmitted: (feedback: FeedbackSubmission) => void;
}

const AIFeedbackSystem: React.FC<Props> = ({
  debtorId,
  currentMessage,
  onMessageGenerated,
  onFeedbackSubmitted
}) => {
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackSubmission>({
    debtor_id: debtorId,
    message_sent: currentMessage || '',
    debtor_response: '',
    outcome: 'no_response',
    effectiveness_score: 5,
    feedback_notes: ''
  });
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (debtorId) {
      loadAIFeedback();
      loadAIInsights();
    }
  }, [debtorId]);

  const loadAIFeedback = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/real-chat/ai-feedback/${debtorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAiFeedback(response.data.data);
    } catch (err: any) {
      setError('Error al cargar feedback de IA');
      console.error('Error loading AI feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/real-chat/insights/${debtorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAiInsights(response.data.data);
    } catch (err: any) {
      console.error('Error loading AI insights:', err);
    }
  };

  const handleUseSuggestedMessage = () => {
    if (aiFeedback?.suggested_message) {
      onMessageGenerated(aiFeedback.suggested_message);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${API_URL}/api/real-chat/ai-feedback`, {
        debtorId: feedbackData.debtor_id,
        feedback: feedbackData.feedback_notes,
        message: feedbackData.message_sent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onFeedbackSubmitted(feedbackData);
      setShowFeedbackDialog(false);
      setFeedbackData({
        debtor_id: debtorId,
        message_sent: '',
        debtor_response: '',
        outcome: 'no_response',
        effectiveness_score: 5,
        feedback_notes: ''
      });
    } catch (err: any) {
      setError('Error al enviar feedback');
      console.error('Error submitting feedback:', err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'low': return <TrendingDown />;
      case 'medium': return <Assessment />;
      case 'high': return <TrendingUp />;
      case 'critical': return <TrendingUp />;
      default: return <Assessment />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SmartToy color="primary" />
            <Typography variant="h6" sx={{ ml: 1 }}>
              IA Analizando...
            </Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* AI Feedback Card */}
      {aiFeedback && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SmartToy color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Recomendaciones de IA
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadAIFeedback}
                size="small"
              >
                Actualizar
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Suggested Message */}
            <Accordion 
              expanded={expandedSections.message}
              onChange={() => toggleSection('message')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Lightbulb color="warning" />
                  <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                    Mensaje Sugerido
                  </Typography>
                  <Chip
                    label={`${(aiFeedback.payment_probability * 100).toFixed(0)}% probabilidad`}
                    color={aiFeedback.payment_probability > 0.7 ? 'success' : aiFeedback.payment_probability > 0.4 ? 'warning' : 'error'}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "{aiFeedback.suggested_message}"
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleUseSuggestedMessage}
                  fullWidth
                >
                  Usar este mensaje
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Collection Strategy */}
            <Accordion 
              expanded={expandedSections.strategy}
              onChange={() => toggleSection('strategy')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Psychology color="info" />
                  <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                    Estrategia de Cobranza
                  </Typography>
                  <Chip
                    icon={getUrgencyIcon(aiFeedback.urgency_level)}
                    label={aiFeedback.urgency_level.toUpperCase()}
                    color={getUrgencyColor(aiFeedback.urgency_level) as any}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {aiFeedback.collection_strategy}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Próxima acción:</strong> {aiFeedback.next_action}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Enfoque personalizado:</strong> {aiFeedback.personalized_approach}
                </Typography>
                <Typography variant="body2">
                  <strong>Evaluación de riesgo:</strong> {aiFeedback.risk_assessment}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Follow-up Schedule (CORREGIDO: SE RENDERIZA SOLO SI EXISTE) */}
            {aiFeedback.follow_up_schedule && (
              <Accordion 
                expanded={expandedSections.followup}
                onChange={() => toggleSection('followup')}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Assessment color="secondary" />
                    <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                      Plan de Seguimiento
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Próximo contacto:</strong> {aiFeedback.follow_up_schedule.next_contact}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Método:</strong> {aiFeedback.follow_up_schedule.method?.toUpperCase() || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Timing:</strong> {aiFeedback.follow_up_schedule.timing}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Legal Recommendations */}
            {aiFeedback.legal_recommendations && (
              <Accordion 
                expanded={expandedSections.legal}
                onChange={() => toggleSection('legal')}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Insights color="error" />
                    <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                      Recomendaciones Legales
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    {aiFeedback.legal_recommendations}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SmartToy color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Insights del Deudor
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Patrón de comportamiento:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {aiInsights.debtor_behavior_pattern}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  <strong>Mejor horario de contacto:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {aiInsights.best_contact_time}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  <strong>Comunicación preferida:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {aiInsights.preferred_communication}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Factores de pago:</strong>
                </Typography>
                <List dense>
                  {aiInsights.payment_triggers.map((trigger, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon>
                        <ThumbUp color="success" />
                      </ListItemIcon>
                      <ListItemText primary={trigger} />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="body2" color="text.secondary">
                  <strong>Factores de riesgo:</strong>
                </Typography>
                <List dense>
                  {aiInsights.risk_factors.map((risk, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon>
                        <ThumbDown color="error" />
                      </ListItemIcon>
                      <ListItemText primary={risk} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Feedback Submission */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Feedback para IA
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AutoFixHigh />}
              onClick={() => setShowFeedbackDialog(true)}
            >
              Enviar Feedback
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Ayuda a mejorar la IA proporcionando feedback sobre la efectividad de los mensajes enviados.
          </Typography>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onClose={() => setShowFeedbackDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Enviar Feedback a la IA</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mensaje Enviado"
            fullWidth
            multiline
            rows={3}
            value={feedbackData.message_sent}
            onChange={(e) => setFeedbackData({...feedbackData, message_sent: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Respuesta del Deudor (opcional)"
            fullWidth
            multiline
            rows={2}
            value={feedbackData.debtor_response}
            onChange={(e) => setFeedbackData({...feedbackData, debtor_response: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Resultado</InputLabel>
            <Select
              value={feedbackData.outcome}
              label="Resultado"
              onChange={(e) => setFeedbackData({...feedbackData, outcome: e.target.value as any})}
            >
              <MenuItem value="payment_made">Pago realizado</MenuItem>
              <MenuItem value="payment_promised">Pago prometido</MenuItem>
              <MenuItem value="no_response">Sin respuesta</MenuItem>
              <MenuItem value="negative_response">Respuesta negativa</MenuItem>
              <MenuItem value="escalation_needed">Necesita escalación</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Efectividad del mensaje (1-10):
            </Typography>
            <Rating
              value={feedbackData.effectiveness_score}
              onChange={(_, newValue) => {
                setFeedbackData({...feedbackData, effectiveness_score: newValue || 5});
              }}
              max={10}
            />
          </Box>
          
          <TextField
            margin="dense"
            label="Notas adicionales"
            fullWidth
            multiline
            rows={3}
            value={feedbackData.feedback_notes}
            onChange={(e) => setFeedbackData({...feedbackData, feedback_notes: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitFeedback} variant="contained">
            Enviar Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIFeedbackSystem;