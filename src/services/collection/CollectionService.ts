// Collection Service - Senior Full Stack Developer Implementation
import { Debtor } from '../../models/Debtor';
import { Cellphone } from '../../models/Cellphone';
import { Chat } from '../../models/Chat';
import { Cost } from '../../models/Cost';
import { PendingMessage } from '../../models/PendingMessage';
import { User } from '../../models/User';
import { Op, Sequelize } from 'sequelize';

export interface CollectionStage {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
  icon: string;
  is_active: boolean;
  debtor_count: number;
  success_rate: number;
  average_duration: number;
  created_at: string;
  updated_at: string;
}

export interface DebtorProgress {
  id: number;
  name: string;
  document: string;
  current_stage: string;
  stage_progress: number;
  last_interaction: string;
  next_action: string;
  payment_probability: number;
  days_in_stage: number;
  total_debt: number;
  contact_info: {
    phone: string;
    email: string;
  };
  stage_history: Array<{
    stage: string;
    entered_at: string;
    exited_at?: string;
    duration_days: number;
  }>;
}

export interface CollectionStats {
  total_debtors: number;
  active_campaigns: number;
  total_collected: number;
  collection_rate: number;
  average_stage_duration: number;
  stage_distribution: {
    [key: string]: number;
  };
  performance_metrics: {
    response_rate: number;
    payment_rate: number;
    escalation_rate: number;
  };
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  start_date: string;
  end_date?: string;
  debtor_count: number;
  collected_amount: number;
  target_amount: number;
  stages: CollectionStage[];
  created_at: string;
  updated_at: string;
}

export interface StageAnalytics {
  stage_name: string;
  total_debtors: number;
  success_rate: number;
  average_duration: number;
  conversion_rate: number;
  revenue_generated: number;
  cost_per_debtor: number;
  roi: number;
}

export interface DebtorTimeline {
  debtor_id: number;
  debtor_name: string;
  events: Array<{
    type: 'stage_change' | 'message_sent' | 'message_received' | 'payment_made' | 'call_made';
    description: string;
    timestamp: string;
    stage?: string;
    amount?: number;
    success: boolean;
  }>;
}

export class CollectionService {
  // Get all collection stages
  static async getCollectionStages(userId: number): Promise<CollectionStage[]> {
    try {
      // For now, return predefined stages. In production, these would come from a database
      const stages: CollectionStage[] = [
        {
          id: '1',
          name: 'Inicial',
          description: 'Primer contacto con el deudor',
          order: 1,
          color: 'primary',
          icon: 'initial',
          is_active: true,
          debtor_count: await this.getDebtorCountByStage('Inicial', userId),
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
          debtor_count: await this.getDebtorCountByStage('Recordatorio', userId),
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
          debtor_count: await this.getDebtorCountByStage('Urgente', userId),
          success_rate: 45.8,
          average_duration: 14,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Final',
          description: 'Última instancia antes de escalación legal',
          order: 4,
          color: 'secondary',
          icon: 'final',
          is_active: true,
          debtor_count: await this.getDebtorCountByStage('Final', userId),
          success_rate: 25.2,
          average_duration: 21,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Completado',
          description: 'Deuda pagada o resuelta',
          order: 5,
          color: 'success',
          icon: 'completed',
          is_active: true,
          debtor_count: await this.getDebtorCountByStage('Completado', userId),
          success_rate: 100,
          average_duration: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return stages;
    } catch (error) {
      console.error('Error getting collection stages:', error);
      throw error;
    }
  }

  // Create new collection stage
  static async createCollectionStage(userId: number, stageData: any): Promise<CollectionStage> {
    try {
      // In production, this would save to database
      const newStage: CollectionStage = {
        id: Date.now().toString(),
        name: stageData.name,
        description: stageData.description,
        order: 6, // Next in sequence
        color: stageData.color || 'default',
        icon: 'custom',
        is_active: true,
        debtor_count: 0,
        success_rate: 0,
        average_duration: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return newStage;
    } catch (error) {
      console.error('Error creating collection stage:', error);
      throw error;
    }
  }

  // Get debtors with their collection progress
  static async getDebtorsWithProgress(userId: number): Promise<DebtorProgress[]> {
    try {
      const debtors = await Debtor.findAll({
        where: { id_user: userId },
        include: [
          {
            model: Cellphone,
            as: 'cellphones',
            attributes: ['to', 'from', 'id']
          }
        ],
        attributes: ['id', 'name', 'document', 'paid', 'email', 'createdAt']
      });

      const debtorProgress: DebtorProgress[] = [];

      for (const debtor of debtors) {
        if (debtor.cellphones && debtor.cellphones.length > 0) {
          const cellphone = debtor.cellphones[0];
          
          // Determine current stage based on payment status and interaction history
          const currentStage = this.determineCurrentStage(debtor.paid, debtor.createdAt);
          
          // Calculate stage progress (0-100)
          const stageProgress = this.calculateStageProgress(currentStage, debtor.paid);
          
          // Get last interaction
          const lastMessage = await Chat.findOne({
            where: {
              [Op.or]: [
                { from_cellphone: cellphone.to, to_cellphone: cellphone.from },
                { from_cellphone: cellphone.from, to_cellphone: cellphone.to }
              ]
            },
            order: [['createdAt', 'DESC']]
          });

          // Calculate payment probability using AI/ML (simplified for now)
          const paymentProbability = await this.calculatePaymentProbability(debtor.id, currentStage);
          
          // Calculate days in current stage
          const daysInStage = this.calculateDaysInStage(debtor.createdAt, currentStage);
          
          // Get stage history
          const stageHistory = await this.getDebtorStageHistory(debtor.id);

          debtorProgress.push({
            id: debtor.id,
            name: debtor.name,
            document: debtor.document,
            current_stage: currentStage,
            stage_progress: stageProgress,
            last_interaction: lastMessage?.createdAt.toISOString() || debtor.createdAt.toISOString(),
            next_action: this.getNextAction(currentStage, paymentProbability),
            payment_probability: paymentProbability,
            days_in_stage: daysInStage,
            total_debt: await this.calculateTotalDebt(debtor.id),
            contact_info: {
              phone: cellphone.to.toString(),
              email: debtor.email || 'N/A'
            },
            stage_history: stageHistory
          });
        }
      }

      return debtorProgress;
    } catch (error) {
      console.error('Error getting debtors with progress:', error);
      throw error;
    }
  }

  // Move debtor to different stage
  static async moveDebtorToStage(debtorId: number, newStage: string, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const debtor = await Debtor.findOne({
        where: { id: debtorId, id_user: userId }
      });

      if (!debtor) {
        throw new Error('Debtor not found');
      }

      // Update debtor's stage (in production, this would be stored in a separate table)
      // For now, we'll update the paid status based on stage
      let newPaidStatus = debtor.paid;
      switch (newStage) {
        case 'Inicial':
          newPaidStatus = 'pending';
          break;
        case 'Recordatorio':
          newPaidStatus = 'pending';
          break;
        case 'Urgente':
          newPaidStatus = 'overdue';
          break;
        case 'Final':
          newPaidStatus = 'overdue';
          break;
        case 'Completado':
          newPaidStatus = 'paid';
          break;
      }

      await debtor.update({ paid: newPaidStatus });

      // Log the stage change
      await Chat.create({
        from_cellphone: 0, // System message
        to_cellphone: 0,
        message: `Deudor movido a etapa: ${newStage}`,
        message_type: 'text',
        status: 'sent',
        cost: 0,
        is_from_debtor: false,
        collection_stage: newStage
      });

      return {
        success: true,
        message: `Deudor movido exitosamente a la etapa: ${newStage}`
      };
    } catch (error) {
      console.error('Error moving debtor to stage:', error);
      throw error;
    }
  }

  // Get collection statistics
  static async getCollectionStats(userId: number): Promise<CollectionStats> {
    try {
      const totalDebtors = await Debtor.count({
        where: { id_user: userId }
      });

      const activeCampaigns = await this.getActiveCampaignsCount(userId);
      
      const totalCollected = await Cost.sum('amount', {
        where: { 
          id_user: userId,
          cost_type: 'payment_received'
        }
      }) || 0;

      const paidDebtors = await Debtor.count({
        where: { id_user: userId, paid: 'paid' }
      });

      const collectionRate = totalDebtors > 0 ? (paidDebtors / totalDebtors) * 100 : 0;

      const averageStageDuration = await this.calculateAverageStageDuration(userId);

      const stageDistribution = await this.getStageDistribution(userId);

      const performanceMetrics = await this.getPerformanceMetrics(userId);

      return {
        total_debtors: totalDebtors,
        active_campaigns: activeCampaigns,
        total_collected: totalCollected,
        collection_rate: collectionRate,
        average_stage_duration: averageStageDuration,
        stage_distribution: stageDistribution,
        performance_metrics: performanceMetrics
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      throw error;
    }
  }

  // Get active campaigns
  static async getActiveCampaigns(userId: number): Promise<Campaign[]> {
    try {
      // In production, this would come from a campaigns table
      const campaigns: Campaign[] = [
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
          stages: await this.getCollectionStages(userId),
          created_at: '2024-01-01T00:00:00Z',
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Campaña Especial Marzo',
          description: 'Campaña especial para deudores de alto valor',
          status: 'active',
          start_date: '2024-03-01',
          debtor_count: 25,
          collected_amount: 12000,
          target_amount: 50000,
          stages: await this.getCollectionStages(userId),
          created_at: '2024-03-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ];

      return campaigns;
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      throw error;
    }
  }

  // Create new campaign
  static async createCampaign(userId: number, campaignData: any): Promise<Campaign> {
    try {
      const newCampaign: Campaign = {
        id: Date.now(),
        name: campaignData.name,
        description: campaignData.description,
        status: 'draft',
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        debtor_count: 0,
        collected_amount: 0,
        target_amount: campaignData.target_amount,
        stages: await this.getCollectionStages(userId),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return newCampaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Update campaign status
  static async updateCampaignStatus(campaignId: number, status: string, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // In production, this would update the campaigns table
      return {
        success: true,
        message: `Campaña ${campaignId} actualizada a estado: ${status}`
      };
    } catch (error) {
      console.error('Error updating campaign status:', error);
      throw error;
    }
  }

  // Get stage performance analytics
  static async getStageAnalytics(userId: number): Promise<StageAnalytics[]> {
    try {
      const stages = await this.getCollectionStages(userId);
      const analytics: StageAnalytics[] = [];

      for (const stage of stages) {
        const stageAnalytics: StageAnalytics = {
          stage_name: stage.name,
          total_debtors: stage.debtor_count,
          success_rate: stage.success_rate,
          average_duration: stage.average_duration,
          conversion_rate: stage.success_rate,
          revenue_generated: stage.debtor_count * 1000, // Mock calculation
          cost_per_debtor: 50, // Mock calculation
          roi: (stage.debtor_count * 1000) / (stage.debtor_count * 50) // Mock calculation
        };

        analytics.push(stageAnalytics);
      }

      return analytics;
    } catch (error) {
      console.error('Error getting stage analytics:', error);
      throw error;
    }
  }

  // Get debtor timeline
  static async getDebtorTimeline(debtorId: number, userId: number): Promise<DebtorTimeline> {
    try {
      const debtor = await Debtor.findOne({
        where: { id: debtorId, id_user: userId },
        attributes: ['id', 'name']
      });

      if (!debtor) {
        throw new Error('Debtor not found');
      }

      // Get all events for this debtor
      const events = await Chat.findAll({
        where: {
          [Op.or]: [
            { from_cellphone: { [Op.like]: `%${debtorId}%` } },
            { to_cellphone: { [Op.like]: `%${debtorId}%` } }
          ]
        },
        order: [['createdAt', 'ASC']]
      });

      const timelineEvents = events.map((event: any) => ({
        type: event.is_from_debtor ? 'message_received' : 'message_sent',
        description: event.message,
        timestamp: event.createdAt.toISOString(),
        stage: event.collection_stage,
        amount: event.cost,
        success: event.status === 'delivered'
      }));

      return {
        debtor_id: debtor.id,
        debtor_name: debtor.name,
        events: timelineEvents
      };
    } catch (error) {
      console.error('Error getting debtor timeline:', error);
      throw error;
    }
  }

  // Bulk move debtors
  static async bulkMoveDebtors(debtorIds: number[], newStage: string, userId: number): Promise<{ success: boolean; moved_count: number }> {
    try {
      let movedCount = 0;

      for (const debtorId of debtorIds) {
        try {
          await this.moveDebtorToStage(debtorId, newStage, userId);
          movedCount++;
        } catch (error) {
          console.error(`Error moving debtor ${debtorId}:`, error);
        }
      }

      return {
        success: true,
        moved_count: movedCount
      };
    } catch (error) {
      console.error('Error in bulk move debtors:', error);
      throw error;
    }
  }

  // Helper methods
  private static async getDebtorCountByStage(stage: string, userId: number): Promise<number> {
    // This would query a debtor_stages table in production
    const debtors = await Debtor.findAll({
      where: { id_user: userId }
    });

    // Mock calculation based on payment status
    switch (stage) {
      case 'Inicial':
        return debtors.filter((d: any) => d.paid === 'pending').length;
      case 'Recordatorio':
        return Math.floor(debtors.length * 0.3);
      case 'Urgente':
        return Math.floor(debtors.length * 0.2);
      case 'Final':
        return Math.floor(debtors.length * 0.1);
      case 'Completado':
        return debtors.filter((d: any) => d.paid === 'paid').length;
      default:
        return 0;
    }
  }

  private static determineCurrentStage(paidStatus: string, createdAt: Date): string {
    const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (paidStatus === 'paid') return 'Completado';
    if (daysSinceCreation < 7) return 'Inicial';
    if (daysSinceCreation < 14) return 'Recordatorio';
    if (daysSinceCreation < 30) return 'Urgente';
    return 'Final';
  }

  private static calculateStageProgress(stage: string, paidStatus: string): number {
    if (paidStatus === 'paid') return 100;
    
    const stageProgress = {
      'Inicial': 20,
      'Recordatorio': 40,
      'Urgente': 60,
      'Final': 80,
      'Completado': 100
    };

    return stageProgress[stage as keyof typeof stageProgress] || 0;
  }

  private static async calculatePaymentProbability(debtorId: number, stage: string): Promise<number> {
    // This would use AI/ML to calculate based on historical data
    const baseProbability = {
      'Inicial': 0.8,
      'Recordatorio': 0.6,
      'Urgente': 0.4,
      'Final': 0.2,
      'Completado': 1.0
    };

    return baseProbability[stage as keyof typeof baseProbability] || 0.5;
  }

  private static calculateDaysInStage(createdAt: Date, stage: string): number {
    const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    const stageDays = {
      'Inicial': Math.min(daysSinceCreation, 7),
      'Recordatorio': Math.max(0, daysSinceCreation - 7),
      'Urgente': Math.max(0, daysSinceCreation - 14),
      'Final': Math.max(0, daysSinceCreation - 30),
      'Completado': 0
    };

    return stageDays[stage as keyof typeof stageDays] || 0;
  }

  private static getNextAction(stage: string, probability: number): string {
    if (probability > 0.7) return 'Enviar recordatorio amigable';
    if (probability > 0.4) return 'Llamar al deudor';
    if (probability > 0.2) return 'Enviar notificación urgente';
    return 'Escalar a etapa final';
  }

  private static async calculateTotalDebt(debtorId: number): Promise<number> {
    // This would calculate based on actual debt records
    return Math.random() * 10000; // Mock value
  }

  private static async getDebtorStageHistory(debtorId: number): Promise<any[]> {
    // This would get from a debtor_stages_history table
    return [];
  }

  private static async getActiveCampaignsCount(userId: number): Promise<number> {
    return 2; // Mock value
  }

  private static async calculateAverageStageDuration(userId: number): Promise<number> {
    return 12; // Mock value in days
  }

  private static async getStageDistribution(userId: number): Promise<{ [key: string]: number }> {
    return {
      'Inicial': 40,
      'Recordatorio': 30,
      'Urgente': 20,
      'Final': 8,
      'Completado': 2
    };
  }

  private static async getPerformanceMetrics(userId: number): Promise<{
    response_rate: number;
    payment_rate: number;
    escalation_rate: number;
  }> {
    return {
      response_rate: 75.5,
      payment_rate: 45.2,
      escalation_rate: 12.8
    };
  }
}

