import { Debtor } from '../../models/Debtor';
import { Stage } from '../../models/Stage';
import { Cost } from '../../models/Cost';
import { Campaign } from '../../models/Campaign';
import { Cellphone } from '../../models/Cellphone';
import { Op } from 'sequelize';
import { User } from '../../models/User';

export class CollectionService {
  static async getCollectionStages(userId: number): Promise<any[]> {
    const dbStages = await Stage.findAll({ where: { id_user: userId }, order: [['order', 'ASC']] });

    // Si no hay etapas, crear las básicas
    if (dbStages.length === 0) {
      const defaults = [
        { name: 'Inicio', color: 'primary', order: 1, description: 'Contacto inicial' },
        { name: 'Completado', color: 'success', order: 999, description: 'Pago verificado' }
      ];
      for (const d of defaults) { await Stage.create({ ...d, id_user: userId }); }
      return this.getCollectionStages(userId);
    }

    return Promise.all(dbStages.map(async (s: any) => ({
      id: s.id.toString(),
      name: s.name,
      description: s.description || 'Sin descripción',
      order: s.order,
      color: s.color,
      debtor_count: await Debtor.count({ where: { id_stage: s.id } }),
      success_rate: s.name.toLowerCase().trim() === 'completado' ? 100 : 0
    })));
  }

  static async getDebtorsWithProgress(userId: number) {
    const debtors = await Debtor.findAll({ where: { id_user: userId }, include: [{ model: Cellphone, as: 'cellphones' }] });
    const stages = await Stage.findAll({ where: { id_user: userId } });

    return debtors.map((d: any) => {
      const currentStage = stages.find((s: any) => s.id.toString() === d.id_stage?.toString());
      const diff = Math.abs(Date.now() - new Date(d.updatedAt).getTime());
      return {
        id: Number(d.id),
        name: d.name,
        document: d.document.toString(),
        id_campaign: d.id_campaign, // IMPORTANTE PARA EL SELECTOR
        current_stage: currentStage ? currentStage.name : 'Inicio',
        stage_progress: d.paid === 'paid' ? 100 : 25,
        days_in_stage: Math.ceil(diff / (1000 * 60 * 60 * 24)),
        next_action: 'Seguimiento',
        payment_probability: 0.5,
        contact_info: { phone: d.cellphones?.[0]?.to || 'S/N' }
      };
    });
  }

  static async getCollectionStats(userId: number) {
    const total = await Debtor.count({ where: { id_user: userId } });
    const collected = await Cost.sum('amount', { where: { id_user: userId, cost_type: 'payment_received' } }) || 0;
    return {
      total_debtors: total,
      total_collected: Number(collected),
      collection_rate: 0,
      average_stage_duration: 5
    };
  }

  static async createCampaign(userId: number, data: any) {
    try {
      return await Campaign.create({
        id_user: userId,
        name: data.name,
        target_amount: data.target_amount,
        status: 'active',
        description: data.description || ''
      });
    } catch (error) {
      console.error('Error en createCampaign:', error);
      throw error;
    }
  }

  static async deleteCampaign(campaignId: number) {
    // 1. Desvinculamos a los deudores de esta campaña antes de borrarla
    await Debtor.update({ id_campaign: null }, { where: { id_campaign: campaignId } });
    // 2. Borramos la campaña
    return await Campaign.destroy({ where: { id: campaignId } });
  }

  static async updateDebtorCampaign(debtorId: number, campaignId: any) {
    // Si campaignId viene como 'none' o vacío, lo seteamos como null
    const idToSet = (campaignId === 'none' || !campaignId) ? null : campaignId;
    return await Debtor.update({ id_campaign: idToSet }, { where: { id: debtorId } });
  }

  static async getActiveCampaigns(userId: number) {
    try {
      const campaigns = await Campaign.findAll({ where: { id_user: userId } });
      console.log(`--- Iniciando cálculo para ${campaigns.length} campañas ---`);

      return await Promise.all(campaigns.map(async (c: any) => {
        // 1. Buscamos deudores
        const debtors = await Debtor.findAll({
          where: { id_campaign: c.id },
          attributes: ['id']
        });
        const debtorIds = debtors.map((d: any) => d.id);
        console.log(`Campaña "${c.name}" tiene los deudores IDs: [${debtorIds}]`);

        // 2. Sumamos montos
        // OJO: Verifica si tus columnas en la DB tienen guion bajo (id_debtor) o no (iddebtor)
        const totalCollected = await Cost.sum('amount', {
          where: {
            id_user: userId,
            // Cambiamos 'type' por la columna real de tu ENUM
            id_debtor: { [Op.in]: debtorIds.length > 0 ? debtorIds : [0] }
          }
        }) || 0;

        console.log(`Suma total para "${c.name}": $${totalCollected}`);

        return {
          id: Number(c.id),
          name: c.name,
          debtor_count: debtorIds.length,
          collected_amount: Number(totalCollected),
          target_amount: Number(c.target_amount) || 1
        };
      }));
    } catch (error) {
      console.error("Error crítico en campañas:", error);
      return [];
    }
  }
  static async createStage(userId: number, data: any) {
    return await Stage.create({ ...data, id_user: userId });
  }

  static async deleteStage(id: number) {
    const stage = await Stage.findByPk(id);
    if (['inicio', 'completado'].includes(stage?.get('name')?.toString().toLowerCase().trim() || '')) return;
    await Debtor.update({ id_stage: null }, { where: { id_stage: id } });
    return await Stage.destroy({ where: { id } });
  }

  static async moveDebtorToStage(debtorId: number, nextStageId: string) {
    const stage = await Stage.findByPk(nextStageId);
    const update: any = { id_stage: nextStageId };
    if (stage?.get('name')?.toString().toLowerCase().trim() === 'completado') update.paid = 'paid';
    return await Debtor.update(update, { where: { id: debtorId } });
  }

  static async registerPayment(userId: number, debtorId: number, amount: number, type: string) {
    try {
      const user: any = await User.findByPk(userId);
      if (!user) throw new Error("User not found");

      return await Cost.create({
        id_company: user.id_company.toString(),
        id_user: userId,
        id_debtor: debtorId,
        amount: amount,
        type: type, // <--- Usamos el valor elegido por el usuario (whatsapp, agent, etc.)
        description: `Pago vía ${type} - Deudor ID: ${debtorId}`,
        status: 'processed'
      });
    } catch (error) {
      console.error('Error en DB:', error);
      throw error;
    }
  }
}