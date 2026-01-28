import { PaymentGateway } from "../domain/PaymentGateway";
import { Payment, PaymentType } from "../domain/Payment";

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export class StripePaymentGateway implements PaymentGateway {
  private stripe: any;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    // Initialize Stripe with secret key
    this.stripe = require("stripe")(config.secretKey);
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    description: string;
    metadata: Record<string, string>;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        description: params.description,
        metadata: params.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent");
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{
    status: string;
    transactionId: string;
    gatewayResponse: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        status: paymentIntent.status,
        transactionId: paymentIntent.id,
        gatewayResponse: JSON.stringify(paymentIntent),
      };
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw new Error("Failed to confirm payment");
    }
  }

  async createSubscription(params: {
    customerId: string;
    priceId: string;
    metadata: Record<string, string>;
  }): Promise<{
    subscriptionId: string;
    clientSecret: string;
  }> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: params.customerId,
        items: [{ price: params.priceId }],
        metadata: params.metadata,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      };
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new Error("Failed to create subscription");
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }

  async createCustomer(params: {
    email: string;
    name: string;
    metadata: Record<string, string>;
  }): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      });

      return customer.id;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<any> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      return event;
    } catch (error) {
      console.error("Error handling webhook:", error);
      throw new Error("Invalid webhook signature");
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    try {
      const refundParams: any = { payment_intent: paymentIntentId };
      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      await this.stripe.refunds.create(refundParams);
    } catch (error) {
      console.error("Error processing refund:", error);
      throw new Error("Failed to process refund");
    }
  }
}
