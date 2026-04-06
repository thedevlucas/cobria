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
  company_name?: string;

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
      ? `\n📱 REGLAS ESTRICTAS PARA WHATSAPP O SMS:
        1. NO escribas el monto exacto de la deuda (ej: no digas "$500").
        2. NO ofrezcas descuentos ni condonaciones por escrito.
        3. Si el usuario pide el monto, invítalo amablemente a una llamada o dile que revise su estado de cuenta adjunto.
        4. NO envíes ni prometas enviar archivos, documentos ni enlaces externos.`
      : "Puedes mencionar el monto de la deuda si es necesario para la negociación.";

    const agentMessages = context.previous_interactions.filter(i => !i.is_from_debtor);
    const isFirstAgentMessage = agentMessages.length === 0;
    const lastDebtorMessage = [...context.previous_interactions].reverse().find(i => i.is_from_debtor);

    const conversationRules = isFirstAgentMessage
      ? `ESTO ES EL PRIMER MENSAJE: Puedes saludar al deudor por su nombre y presentarte brevemente.`
      : `CONVERSACIÓN EN CURSO: Ya has intercambiado mensajes con el deudor. 
         - NO te presentes de nuevo ni repitas saludos ("Hola", "Buenos días", etc.).
         - Responde DIRECTAMENTE al último mensaje del deudor: "${lastDebtorMessage?.message || ''}"
         - Mantén la coherencia y continuidad de la conversación anterior.
         - Sé natural, como si continuaras una conversación humana.`;

    const history = context.previous_interactions
      .map(i => `${i.is_from_debtor ? 'Deudor' : 'Agente'}: ${i.message}`)
      .join('\n');

    return `
      Eres un agente de cobranzas profesional y empático. Tu único trabajo en este momento es generar el SIGUIENTE mensaje de respuesta dentro de una conversación activa.

      ${feedbackSection}
      ${whatsappRules}

      ⚠️ FORMATO DEL MENSAJE (MUY IMPORTANTE):
      - Escribe en texto plano. NUNCA uses markdown: sin **, sin *, sin _, sin #, sin listas con guiones.
      - Si el deudor pregunta algo que ya sabes (monto, empresa acreedora), respóndelo DIRECTAMENTE sin preguntar si quiere que lo consultes o lo informes. Ya lo sabes, dilo.

      🚫 LO QUE NO PUEDES HACER (NUNCA lo prometas ni lo menciones):
      - Enviar archivos, documentos, PDFs ni enlaces de ningún tipo.
      - Coordinar ni prometer llamadas telefónicas.
      - Prometer que alguien del equipo lo llamará o se contactará por otro canal.
      - Ofrecer descuentos, quitas ni condonaciones de deuda.
      Si el deudor pide algo de lo anterior, explícale amablemente que eso lo debe gestionar directamente con el área de atención al cliente de ${context.company_name || 'la empresa'}, y redirige la conversación hacia acordar el pago.

      ✅ LO QUE SÍ PUEDES HACER:
      - Escuchar y mostrar empatía.
      - Informar el monto exacto de la deuda (${context.debt_amount > 0 ? `$${context.debt_amount.toLocaleString()}` : 'disponible en el sistema'}).
      - Indicar que el pago debe realizarse directamente a ${context.company_name || 'la empresa acreedora'}.
      - Pedirle que envíe el comprobante de pago por este mismo chat una vez que haya pagado.
      - Proponer un plan de cuotas o fecha de pago comprometida.
      - Solicitar una promesa de pago con fecha concreta.

      INFORMACIÓN DEL DEUDOR:
      - Nombre: ${context.debtor_name}
      - Empresa acreedora: ${context.company_name || 'la empresa'}
      - Monto de la deuda: ${context.debt_amount > 0 ? `$${context.debt_amount.toLocaleString()}` : 'a consultar'}
      - Estado: ${context.payment_status}
      - Días de Atraso: ${context.days_overdue}

      HISTORIAL COMPLETO DE LA CONVERSACIÓN (orden cronológico):
      ${history}

      REGLAS DE CONTINUIDAD:
      ${conversationRules}

      TU TAREA:
      Genera ÚNICAMENTE el siguiente mensaje del Agente en formato JSON (sin bloques de código markdown):
      {
        "message": "El mensaje que le enviarás al deudor ahora",
        "strategy": "Estrategia usada (ej: Empatía, Negociación, Urgencia)",
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