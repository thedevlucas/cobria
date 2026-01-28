import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-flash";

export interface AIConfig {
  apiKey: string;
  model: string;
}

export interface CollectionContext {
  debtor_name: string;
  debtor_document: string;
  payment_status: string;
  debt_amount: number;
  days_overdue: number;
  admin_feedback?: string[]; 
  collection_channel: 'whatsapp' | 'call' | 'email';
  
  previous_interactions: Array<{
    message: string;
    is_from_debtor: boolean;
    timestamp: string;
    response_time?: number;
  }>;
  debtor_profile: {
    age_range?: string;
    payment_history: string;
    communication_preference: string;
    financial_situation?: string;
  };
  collection_stage: string;
  legal_status?: string;
}

export interface AIResponse {
  suggested_message: string;
  collection_strategy: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  next_action: string;
  payment_probability: number;
  personalized_approach: string;
  risk_assessment: string;
  legal_recommendations?: string;
  follow_up_schedule: {
    next_contact: string;
    method: 'whatsapp' | 'sms' | 'call' | 'email';
    timing: string;
  };
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  async generateCollectionMessage(context: CollectionContext): Promise<AIResponse> {
    try {
      const prompt = this.buildCollectionPrompt(context);
      const response = await this.callGeminiAPI(prompt);
      return this.parseAIResponse(response, context);
    } catch (error) {
      console.error('Error generating collection message with Gemini:', error);
      throw error;
    }
  }


  private buildCollectionPrompt(context: CollectionContext): string {
    // 1. Detectamos el último mensaje real del usuario para priorizarlo
    const lastInteraction = context.previous_interactions[context.previous_interactions.length - 1];
    const lastUserMessage = lastInteraction?.is_from_debtor ? lastInteraction.message : "(Inicio de conversación)";

    // 2. Definimos reglas dinámicas según si ya hay historial o no
    const hasHistory = context.previous_interactions.length > 1;
    const toneInstruction = hasHistory 
      ? "NO saludes nuevamente tipo 'Hola soy...'. Ve directo al grano o responde la pregunta."
      : "Saluda cordialmente y preséntate.";

    return `
      Actúa como un asistente de cobranzas profesional, empático pero firme.
      Tu nombre es Asistente Virtual.

      INFORMACIÓN DEL DEUDOR:
      - Nombre: ${context.debtor_name}
      - Estado: ${context.payment_status}
      - Deuda Total: $${context.debt_amount}
      
      CONTEXTO ACTUAL:
      El usuario acaba de escribir: "${lastUserMessage}"
      
      HISTORIAL DE CHAT (Úsalo para entender el contexto, pero RESPONDE al mensaje de arriba):
      ${context.previous_interactions.map(i => `[${i.is_from_debtor ? 'USUARIO' : 'AGENTE'}]: ${i.message}`).join('\n')}

      INSTRUCCIONES CLAVE:
      1. ${toneInstruction}
      2. Si el usuario hace una pregunta, RESPÓNDELA.
      3. Si el usuario pone una excusa, empatiza brevemente y pide una fecha de pago.
      4. Si el usuario ya dijo que va a pagar, confirma los detalles.
      5. NO repitas el mismo mensaje que enviaste la última vez.
      
      Genera una respuesta JSON estrictamente con esta estructura (sin markdown):
      {
        "message": "Tu respuesta al usuario aquí",
        "strategy": "Negotiation|Reminder|Closing",
        "urgency": "low|medium|high",
        "next_action": "Acción siguiente sugerida"
      }
    `;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonString = text.replace(/```json|```/g, '').trim();
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        message: "Estimado cliente, por favor contáctenos para regularizar su situación.",
        strategy: "Fallback",
        urgency: "medium",
        next_action: "Manual Review",
        probability: 0,
        risk: "Unknown",
        follow_up: "24h"
      };
    }
  }

  private parseAIResponse(response: any, context: CollectionContext): AIResponse {
    return {
      suggested_message: response.message,
      collection_strategy: response.strategy,
      urgency_level: response.urgency,
      next_action: response.next_action,
      payment_probability: response.probability,
      personalized_approach: "AI Generated",
      risk_assessment: response.risk,
      legal_recommendations: "Verificar leyes locales",
      follow_up_schedule: {
        next_contact: response.follow_up,
        method: context.collection_channel,
        timing: "As per strategy"
      }
    };
  }
}