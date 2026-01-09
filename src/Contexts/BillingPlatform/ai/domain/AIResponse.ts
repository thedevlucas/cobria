export interface AIResponse {
  content: string;
  confidence: number;
  tokensUsed: number;
  processingTime: number;
  model: string;
}
