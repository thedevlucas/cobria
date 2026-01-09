import { GoogleGenerativeAI } from "@google/generative-ai";

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
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    
    const feedbackSection = context.admin_feedback && context.admin_feedback.length > 0
      ? `\n🔴 INSTRUCCIONES PRIORITARIAS DEL SUPERVISOR (FEEDBACK):\n${context.admin_feedback.map(f => `- ${f}`).join('\n')}\n(Estas instrucciones sobreescriben cualquier otra regla).`
      : "";

    const whatsappRules = context.collection_channel === 'whatsapp'
      ? `\n📱 REGLAS ESTRICTAS PARA WHATSAPP:
         - NO menciones el monto exacto de la deuda (ej: no digas "$500").
         - NO ofrezcas descuentos por escrito.
         - Si el usuario pide el monto, invítalo a una llamada o dile que revise su estado de cuenta.`
      : "";

    return `
      Actúa como un experto asistente de cobranzas. Genera un mensaje para el deudor basándote en el siguiente contexto.

      ${feedbackSection}
      ${whatsappRules}

      INFORMACIÓN DEL DEUDOR:
      - Nombre: ${context.debtor_name}
      - Estado: ${context.payment_status}
      - Días de Atraso: ${context.days_overdue}
      - Etapa: ${context.collection_stage}
      
      HISTORIAL DE CHAT:
      ${context.previous_interactions.map(i => `${i.is_from_debtor ? 'Deudor' : 'Agente'}: ${i.message}`).join('\n')}

      Genera una respuesta JSON (sin markdown) con esta estructura exacta:
      {
        "message": "Tu mensaje sugerido para el deudor",
        "strategy": "Estrategia usada",
        "urgency": "low|medium|high|critical",
        "next_action": "Siguiente paso",
        "probability": 0.5,
        "risk": "Riesgo",
        "follow_up": "Fecha sugerida"
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