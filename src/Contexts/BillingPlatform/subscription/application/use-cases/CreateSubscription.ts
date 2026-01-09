import { Subscription, SubscriptionPlan, SubscriptionStatus } from "../../domain/Subscription";
import { SubscriptionRepository } from "../../domain/SubscriptionRepository";
import { PaymentGateway } from "../../../payment/domain/PaymentGateway";
import { Payment, PaymentType, PaymentStatus } from "../../../payment/domain/Payment";
import { PaymentRepository } from "../../../payment/domain/PaymentRepository";

export interface CreateSubscriptionParams {
  companyId: number;
  plan: SubscriptionPlan;
  paymentMethodId: string;
  customerEmail: string;
  customerName: string;
}

export class CreateSubscription {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway
  ) {}

  async run(params: CreateSubscriptionParams): Promise<{
    subscription: Subscription;
    clientSecret: string;
    paymentIntentId: string;
  }> {
    // Get plan details
    const planDetails = this.getPlanDetails(params.plan);
    
    // Create or get customer
    const customerId = await this.paymentGateway.createCustomer({
      email: params.customerEmail,
      name: params.customerName,
      metadata: {
        companyId: params.companyId.toString(),
      },
    });

    // Create subscription in payment gateway
    const { subscriptionId, clientSecret } = await this.paymentGateway.createSubscription({
      customerId,
      priceId: planDetails.priceId,
      metadata: {
        companyId: params.companyId.toString(),
        plan: params.plan,
      },
    });

    // Create subscription in database
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const subscription = Subscription.create({
      companyId: params.companyId,
      plan: params.plan,
      status: SubscriptionStatus.PENDING,
      startDate,
      endDate,
      monthlyPrice: planDetails.monthlyPrice,
      features: planDetails.features,
      maxDebtors: planDetails.maxDebtors,
      maxAgents: planDetails.maxAgents,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // Create payment record
    const payment = Payment.create({
      companyId: params.companyId,
      amount: planDetails.monthlyPrice,
      currency: "COP",
      type: PaymentType.SUBSCRIPTION,
      status: PaymentStatus.PENDING,
      description: `Suscripción ${params.plan} - ${planDetails.monthlyPrice} COP/mes`,
      paymentMethod: "stripe",
      subscriptionId: savedSubscription.id,
      periodStart: startDate,
      periodEnd: endDate,
    });

    await this.paymentRepository.save(payment);

    return {
      subscription: savedSubscription,
      clientSecret,
      paymentIntentId: subscriptionId,
    };
  }

  private getPlanDetails(plan: SubscriptionPlan) {
    const plans = {
      [SubscriptionPlan.BASIC]: {
        monthlyPrice: 50000, // 50,000 COP
        priceId: "price_basic_monthly", // Stripe price ID
        features: [
          "Hasta 100 deudores",
          "1 agente virtual",
          "WhatsApp y llamadas",
          "Reportes básicos",
          "Soporte por email",
        ],
        maxDebtors: 100,
        maxAgents: 1,
      },
      [SubscriptionPlan.PROFESSIONAL]: {
        monthlyPrice: 150000, // 150,000 COP
        priceId: "price_professional_monthly",
        features: [
          "Hasta 500 deudores",
          "3 agentes virtuales",
          "WhatsApp, llamadas y SMS",
          "Reportes avanzados",
          "Análisis de IA",
          "Soporte prioritario",
        ],
        maxDebtors: 500,
        maxAgents: 3,
      },
      [SubscriptionPlan.ENTERPRISE]: {
        monthlyPrice: 300000, // 300,000 COP
        priceId: "price_enterprise_monthly",
        features: [
          "Deudores ilimitados",
          "Agentes ilimitados",
          "Todos los canales",
          "Reportes personalizados",
          "IA avanzada",
          "Soporte 24/7",
          "API personalizada",
        ],
        maxDebtors: -1, // Unlimited
        maxAgents: -1, // Unlimited
      },
    };

    return plans[plan];
  }
}
