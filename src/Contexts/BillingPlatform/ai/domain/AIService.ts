import { AIResponse } from "./AIResponse";

export interface AIService {
  generateResponse(params: {
    prompt: string;
    context?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    systemPrompt?: string;
  }): Promise<AIResponse>;

  analyzeDebtContext(params: {
    debtorInfo: Record<string, any>;
    conversationHistory: Array<{ role: string; content: string }>;
    debtAmount: number;
  }): Promise<AIResponse>;

  processPaymentConfirmation(params: {
    message: string;
    expectedAmount: number;
    debtorInfo: Record<string, any>;
  }): Promise<AIResponse>;

  generateFollowUpMessage(params: {
    debtorStatus: string;
    lastInteraction: string;
    daysSinceLastContact: number;
    debtAmount: number;
  }): Promise<AIResponse>;
}
