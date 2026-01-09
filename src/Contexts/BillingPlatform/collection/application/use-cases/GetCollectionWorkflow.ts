import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  debtors: number;
  successRate: number;
  averageTime: number;
  nextAction?: string;
}

export interface DebtorProgress {
  id: number;
  name: string;
  document: string;
  currentStage: string;
  stageHistory: Array<{
    stage: string;
    timestamp: Date;
    status: string;
    notes?: string;
  }>;
  debtAmount: number;
  lastContact: Date;
  nextScheduledAction?: Date;
}

export interface CollectionWorkflowResult {
  stages: WorkflowStage[];
  debtors: DebtorProgress[];
}

export class GetCollectionWorkflow {
  constructor(private readonly debtorRepository: DebtorRepository) {}

  async run(params: { userId: number }): Promise<CollectionWorkflowResult> {
    // Get all debtors for the company
    const allDebtors = await this.debtorRepository.findByCompany(params.userId) || [];

    // Define workflow stages
    const stages: WorkflowStage[] = [
      {
        id: "1",
        name: "initial_contact",
        description: "Primer contacto con el deudor",
        status: "in_progress",
        debtors: allDebtors.filter((d: any) => d.paid === PaymentStatus.NO_CONTACT).length,
        successRate: 75.5,
        averageTime: 2,
        nextAction: "Enviar recordatorio",
      },
      {
        id: "2",
        name: "follow_up",
        description: "Seguimiento y recordatorios",
        status: "in_progress",
        debtors: allDebtors.filter((d: any) => d.paid === PaymentStatus.CONTACT).length,
        successRate: 60.2,
        averageTime: 5,
        nextAction: "Programar llamada",
      },
      {
        id: "3",
        name: "negotiation",
        description: "Negociación de términos de pago",
        status: "in_progress",
        debtors: allDebtors.filter((d: any) => d.paid === PaymentStatus.PAYMENT_AGREEMENMT).length,
        successRate: 45.8,
        averageTime: 7,
        nextAction: "Enviar propuesta",
      },
      {
        id: "4",
        name: "payment_arrangement",
        description: "Acuerdo de pago establecido",
        status: "completed",
        debtors: allDebtors.filter((d: any) => d.paid === PaymentStatus.FINANCED_PAYMENT).length,
        successRate: 85.3,
        averageTime: 3,
        nextAction: "Monitorear pagos",
      },
      {
        id: "5",
        name: "collection_complete",
        description: "Cobranza completada",
        status: "completed",
        debtors: allDebtors.filter((d: any) => d.paid === PaymentStatus.PAID).length,
        successRate: 100,
        averageTime: 1,
      },
    ];

    // Transform debtors to progress format
    const debtors: DebtorProgress[] = allDebtors.map((debtor: any) => ({
      id: debtor.id,
      name: debtor.name,
      document: debtor.document.toString(),
      currentStage: this.mapPaymentStatusToStage(debtor.paid),
      stageHistory: this.generateStageHistory(debtor),
      debtAmount: debtor.debtAmount || 0,
      lastContact: debtor.updatedAt || debtor.createdAt,
      nextScheduledAction: this.calculateNextAction(debtor),
    }));

    return {
      stages,
      debtors,
    };
  }

  private mapPaymentStatusToStage(paymentStatus: PaymentStatus): string {
    switch (paymentStatus) {
      case PaymentStatus.NO_CONTACT:
        return "initial_contact";
      case PaymentStatus.CONTACT:
        return "follow_up";
      case PaymentStatus.PAYMENT_AGREEMENMT:
        return "negotiation";
      case PaymentStatus.FINANCED_PAYMENT:
        return "payment_arrangement";
      case PaymentStatus.PAID:
        return "collection_complete";
      case PaymentStatus.PARTIAL_PAID:
        return "payment_arrangement";
      default:
        return "initial_contact";
    }
  }

  private generateStageHistory(debtor: any): Array<{
    stage: string;
    timestamp: Date;
    status: string;
    notes?: string;
  }> {
    const history = [];
    
    // Add initial contact
    history.push({
      stage: "initial_contact",
      timestamp: debtor.createdAt,
      status: "completed",
      notes: "Contacto inicial creado",
    });

    // Add current stage if different from initial
    const currentStage = this.mapPaymentStatusToStage(debtor.paid);
    if (currentStage !== "initial_contact") {
      history.push({
        stage: currentStage,
        timestamp: debtor.updatedAt || debtor.createdAt,
        status: debtor.paid === PaymentStatus.PAID ? "completed" : "in_progress",
        notes: `Estado actual: ${debtor.paid}`,
      });
    }

    return history;
  }

  private calculateNextAction(debtor: any): Date | undefined {
    const lastUpdate = new Date(debtor.updatedAt || debtor.createdAt);
    const nextAction = new Date(lastUpdate);
    
    // Add days based on current stage
    const currentStage = this.mapPaymentStatusToStage(debtor.paid);
    switch (currentStage) {
      case "initial_contact":
        nextAction.setDate(nextAction.getDate() + 2); // Follow up in 2 days
        break;
      case "follow_up":
        nextAction.setDate(nextAction.getDate() + 3); // Next follow up in 3 days
        break;
      case "negotiation":
        nextAction.setDate(nextAction.getDate() + 1); // Check negotiation in 1 day
        break;
      case "payment_arrangement":
        nextAction.setDate(nextAction.getDate() + 7); // Check payment in 7 days
        break;
      default:
        return undefined;
    }

    return nextAction;
  }
}
