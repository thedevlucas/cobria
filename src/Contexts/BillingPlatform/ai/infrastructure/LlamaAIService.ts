import { AIService } from "../domain/AIService";
import { AIResponse } from "../domain/AIResponse";

export interface LlamaConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
}

export class LlamaAIService implements AIService {
  private config: LlamaConfig;

  constructor(config: LlamaConfig) {
    this.config = config;
  }

  async generateResponse(params: {
    prompt: string;
    context?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    systemPrompt?: string;
  }): Promise<AIResponse> {
    try {
      const messages = this.buildMessages(params);
      
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || data.message || "",
        confidence: this.calculateConfidence(data),
        tokensUsed: data.tokens_used || 0,
        processingTime: data.processing_time || 0,
        model: this.config.model,
      };
    } catch (error) {
      console.error("Error calling Llama API:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async analyzeDebtContext(params: {
    debtorInfo: Record<string, any>;
    conversationHistory: Array<{ role: string; content: string }>;
    debtAmount: number;
  }): Promise<AIResponse> {
    const systemPrompt = this.getDebtCollectionSystemPrompt();
    const contextPrompt = this.buildDebtContextPrompt(params);

    return this.generateResponse({
      prompt: contextPrompt,
      systemPrompt,
      conversationHistory: params.conversationHistory,
    });
  }

  async processPaymentConfirmation(params: {
    message: string;
    expectedAmount: number;
    debtorInfo: Record<string, any>;
  }): Promise<AIResponse> {
    const systemPrompt = `
      Eres un asistente especializado en verificar confirmaciones de pago.
      Analiza el mensaje del usuario y determina si confirma un pago.
      Responde con un JSON que contenga:
      - confirmed: boolean (si confirma el pago)
      - amount: number (monto mencionado, si aplica)
      - paymentMethod: string (método de pago mencionado)
      - confidence: number (0-1, qué tan seguro estás)
      - response: string (respuesta apropiada al usuario)
    `;

    const prompt = `
      Mensaje del usuario: "${params.message}"
      Monto esperado: ${params.expectedAmount}
      Información del deudor: ${JSON.stringify(params.debtorInfo)}
      
      Analiza si el usuario confirma el pago y responde con el JSON solicitado.
    `;

    return this.generateResponse({
      prompt,
      systemPrompt,
    });
  }

  async generateFollowUpMessage(params: {
    debtorStatus: string;
    lastInteraction: string;
    daysSinceLastContact: number;
    debtAmount: number;
  }): Promise<AIResponse> {
    const systemPrompt = this.getDebtCollectionSystemPrompt();
    
    const prompt = `
      Genera un mensaje de seguimiento apropiado para:
      - Estado del deudor: ${params.debtorStatus}
      - Última interacción: ${params.lastInteraction}
      - Días desde último contacto: ${params.daysSinceLastContact}
      - Monto de la deuda: ${params.debtAmount}
      
      El mensaje debe ser profesional, empático pero firme, y motivar al pago.
    `;

    return this.generateResponse({
      prompt,
      systemPrompt,
    });
  }

  private buildMessages(params: {
    prompt: string;
    context?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    systemPrompt?: string;
  }): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (params.systemPrompt) {
      messages.push({
        role: "system",
        content: params.systemPrompt,
      });
    }

    if (params.context) {
      messages.push({
        role: "system",
        content: `Contexto: ${params.context}`,
      });
    }

    if (params.conversationHistory) {
      messages.push(...params.conversationHistory);
    }

    messages.push({
      role: "user",
      content: params.prompt,
    });

    return messages;
  }

  private getDebtCollectionSystemPrompt(): string {
    return `
      Eres un asistente virtual especializado en cobranzas. Tu objetivo es ayudar a recuperar deudas de manera profesional y empática.

      REGLAS IMPORTANTES:
      1. Siempre mantén un tono profesional y respetuoso
      2. No amenaces ni uses lenguaje agresivo
      3. Ofrece soluciones de pago flexibles (cuotas, descuentos por pago anticipado)
      4. Escucha las preocupaciones del deudor y adapta tu respuesta
      5. Mantén la información de la deuda confidencial
      6. Si el deudor no puede pagar, ofrece alternativas como planes de pago
      7. Siempre confirma la identidad antes de discutir detalles de la deuda
      8. Si el deudor promete pagar, establece fechas específicas y compromisos claros

      OBJETIVOS:
      - Establecer contacto efectivo con el deudor
      - Negociar términos de pago favorables
      - Mantener una relación profesional
      - Maximizar la recuperación de la deuda
      - Minimizar el tiempo de cobranza

      Responde de manera concisa, profesional y orientada a resultados.
    `;
  }

  private buildDebtContextPrompt(params: {
    debtorInfo: Record<string, any>;
    conversationHistory: Array<{ role: string; content: string }>;
    debtAmount: number;
  }): string {
    return `
      Información del deudor:
      - Nombre: ${params.debtorInfo.name || 'No disponible'}
      - Documento: ${params.debtorInfo.document || 'No disponible'}
      - Monto de la deuda: $${params.debtAmount.toLocaleString()}
      - Fecha de vencimiento: ${params.debtorInfo.dueDate || 'No disponible'}
      - Notas adicionales: ${params.debtorInfo.notes || 'Ninguna'}

      Historial de conversación:
      ${params.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

      Basándote en esta información y el historial de conversación, genera una respuesta apropiada para continuar la gestión de cobranza.
    `;
  }

  private calculateConfidence(data: any): number {
    // Simple confidence calculation based on response length and structure
    const response = data.response || data.message || "";
    const hasStructure = response.includes(":") || response.includes(".");
    const hasReasonableLength = response.length > 10 && response.length < 500;
    
    let confidence = 0.5; // Base confidence
    
    if (hasStructure) confidence += 0.2;
    if (hasReasonableLength) confidence += 0.2;
    if (response.includes("pago") || response.includes("deuda")) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}
