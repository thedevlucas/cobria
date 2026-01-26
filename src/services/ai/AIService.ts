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
  // -----------------------------------

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
    if (!apiKey) {
      console.warn("⚠️ API Key de Gemini no encontrada. La IA no funcionará correctamente.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  async generateCollectionMessage(context: CollectionContext): Promise<AIResponse> {
    try {
      const prompt = this.buildCollectionPrompt(context);
      const response = await this.callGeminiAPI(prompt);
      

      return this.parseAIResponse(response, context);
    } catch (error) {
      console.error('Error generando mensaje con Gemini:', error);

      return this.getFallbackResponse();
    }
  }

  private buildCollectionPrompt(context: CollectionContext): string {
    const feedbackSection = context.admin_feedback && context.admin_feedback.length > 0
      ? `\n🔴 INSTRUCCIONES PRIORITARIAS DEL SUPERVISOR (IMPORTANTE):\n${context.admin_feedback.map(f => `- ${f}`).join('\n')}\n(Obedece estas instrucciones por encima de cualquier otra regla).`
      : "";


    const whatsappRules = context.collection_channel === 'whatsapp'
      ? `\n📱 REGLAS ESTRICTAS PARA WHATSAPP:
         1. NO escribas el monto exacto de la deuda (ej: no digas "$500").
         2. NO ofrezcas descuentos ni condonaciones por escrito.
         3. Si el usuario pide el monto, invítalo amablemente a una llamada o dile que revise su estado de cuenta adjunto.`
      : "Puedes mencionar el monto de la deuda si es necesario para la negociación.";

    return `
      Actúa como un experto asistente de cobranzas. Tu tono es profesional pero empático.
      Genera un mensaje de respuesta para el deudor basándote en el siguiente contexto.

      ${feedbackSection}
      ${whatsappRules}

      INFORMACIÓN DEL DEUDOR:
      - Nombre: ${context.debtor_name}
      - Estado: ${context.payment_status}
      - Días de Atraso: ${context.days_overdue}
      
      HISTORIAL DE CHAT RECIENTE:
      ${context.previous_interactions.map(i => `${i.is_from_debtor ? 'Deudor' : 'Agente'}: ${i.message}`).join('\n')}

      TU TAREA:
      Genera una respuesta en formato JSON (sin bloques de código markdown) con esta estructura exacta:
      {
        "message": "El mensaje que le enviarás al deudor",
        "strategy": "Estrategia usada (ej: Recordatorio amable, Urgencia)",
        "urgency": "low|medium|high|critical",
        "next_action": "Siguiente paso recomendado",
        "probability": 0.5,
        "risk": "Bajo/Medio/Alto",
        "follow_up": "Fecha sugerida para próximo contacto"
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
      console.error('Error parseando respuesta de Gemini:', error);
      throw error;
    }
  }

  private parseAIResponse(response: any, context: CollectionContext): AIResponse {
    return {
      suggested_message: response.message,
      collection_strategy: response.strategy,
      urgency_level: response.urgency || 'medium',
      next_action: response.next_action,
      payment_probability: response.probability || 0.5,
      personalized_approach: "AI Generated based on context",
      risk_assessment: response.risk,
      legal_recommendations: "Verificar leyes locales antes de proceder legalmente.",
      follow_up_schedule: {
        next_contact: response.follow_up,
        method: context.collection_channel,
        timing: "Según estrategia"
      }
    };
  }

  private getFallbackResponse(): AIResponse {
    return {
      suggested_message: "Estimado cliente, le recordamos que tiene una deuda pendiente. Por favor contáctenos para regularizar su situación.",
      collection_strategy: "Fallback",
      urgency_level: "medium",
      next_action: "Manual Review",
      payment_probability: 0,
      personalized_approach: "System Fallback",
      risk_assessment: "Unknown",
      legal_recommendations: "None",
      follow_up_schedule: {
        next_contact: "24h",
        method: 'whatsapp',
        timing: "24h"
      }
    };
  }
}

export const defaultAIConfig: AIConfig = {
  apiKey: process.env.GEMINI_API_KEY || '', 
  model: MODEL_NAME
};