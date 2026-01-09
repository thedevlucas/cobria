// Working Collection Management Route - No Dependencies
import express from 'express';

const router = express.Router();

// Simple middleware for testing
const simpleAuth = (req: any, res: any, next: any) => {
  // For now, just add a mock user ID
  req.body = { idUser: 1 };
  next();
};

// Get collection stages
router.get('/stages', simpleAuth, async (req, res) => {
  try {
    const { idUser } = req.body;
    
    // Mock collection stages
    const stages = [
      {
        id: '1',
        name: 'Inicial',
        description: 'Primer contacto con el deudor',
        order: 1,
        color: 'primary',
        icon: 'initial',
        is_active: true,
        debtor_count: 15,
        success_rate: 85.5,
        average_duration: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Recordatorio',
        description: 'Envío de recordatorios de pago',
        order: 2,
        color: 'warning',
        icon: 'reminder',
        is_active: true,
        debtor_count: 8,
        success_rate: 72.3,
        average_duration: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Urgente',
        description: 'Comunicación urgente por impago',
        order: 3,
        color: 'error',
        icon: 'urgent',
        is_active: true,
        debtor_count: 3,
        success_rate: 45.8,
        average_duration: 14,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: stages
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get debtors with their collection progress
router.get('/debtors', simpleAuth, async (req, res) => {
  try {
    const { idUser } = req.body;
    
    // Mock debtor progress data
    const debtors = [
      {
        id: 1,
        name: 'John Doe',
        document: '12345678',
        current_stage: 'Inicial',
        stage_progress: 25,
        last_interaction: new Date().toISOString(),
        next_action: 'Enviar recordatorio amigable',
        payment_probability: 0.75,
        days_in_stage: 2,
        total_debt: 1500.00,
        contact_info: {
          phone: '1234567890',
          email: 'john@example.com'
        },
        stage_history: []
      },
      {
        id: 2,
        name: 'Jane Smith',
        document: '87654321',
        current_stage: 'Recordatorio',
        stage_progress: 60,
        last_interaction: new Date().toISOString(),
        next_action: 'Llamar al deudor',
        payment_probability: 0.45,
        days_in_stage: 5,
        total_debt: 2300.00,
        contact_info: {
          phone: '9876543210',
          email: 'jane@example.com'
        },
        stage_history: []
      }
    ];
    
    res.json({
      success: true,
      data: debtors
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get collection statistics
router.get('/stats', simpleAuth, async (req, res) => {
  try {
    const { idUser } = req.body;
    
    // Mock collection statistics
    const stats = {
      total_debtors: 25,
      active_campaigns: 2,
      total_collected: 15000.00,
      collection_rate: 68.5,
      average_stage_duration: 12,
      stage_distribution: {
        'Inicial': 15,
        'Recordatorio': 8,
        'Urgente': 2,
        'Final': 0,
        'Completado': 5
      },
      performance_metrics: {
        response_rate: 75.5,
        payment_rate: 45.2,
        escalation_rate: 12.8
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active campaigns
router.get('/campaigns', simpleAuth, async (req, res) => {
  try {
    const { idUser } = req.body;
    
    // Mock campaigns data
    const campaigns = [
      {
        id: 1,
        name: 'Campaña Q1 2024',
        description: 'Campaña de cobranza para el primer trimestre',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        debtor_count: 150,
        collected_amount: 45000,
        target_amount: 100000,
        stages: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move debtor to different stage
router.post('/move-debtor', simpleAuth, async (req, res) => {
  try {
    const { debtor_id, new_stage } = req.body;
    const { idUser } = req.body;
    
    // Mock response
    const result = {
      success: true,
      message: `Debtor moved successfully to stage: ${new_stage}`
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


