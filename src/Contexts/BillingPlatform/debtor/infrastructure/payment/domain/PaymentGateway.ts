export interface PaymentGateway {
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    description: string;
    metadata: Record<string, string>;
  }): Promise<{ clientSecret: string; paymentIntentId: string }>;

  confirmPayment(paymentIntentId: string): Promise<{
    status: string;
    transactionId: string;
    gatewayResponse: string;
  }>;

  createSubscription(params: {
    customerId: string;
    priceId: string;
    metadata: Record<string, string>;
  }): Promise<{
    subscriptionId: string;
    clientSecret: string;
  }>;

  cancelSubscription(subscriptionId: string): Promise<void>;

  createCustomer(params: {
    email: string;
    name: string;
    metadata: Record<string, string>;
  }): Promise<string>;

  handleWebhook(payload: string, signature: string): Promise<any>;

  refundPayment(paymentIntentId: string, amount?: number): Promise<void>;
}
