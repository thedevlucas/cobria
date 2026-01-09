// Dependencies
let ocrSpace: any;
try {
    const ocrModule = require('ocr-space-api-wrapper');
    ocrSpace = ocrModule.ocrSpace;
} catch (error) {
    console.warn('OCR module not found, using fallback implementation');
    ocrSpace = null;
}

// Constants
import { ocrConfig, ocr_api_key } from "../../../config/Constants";

export async function getText4Image(image: string): Promise<string> {
    try {
        if (ocrSpace && ocr_api_key) {
            const text = await ocrSpace(image, {
                apiKey: ocr_api_key,
                language: ocrConfig.language,
            });
            return text.ParsedResults[0].ParsedText;
        } else {
            // Fallback: return placeholder text
            console.warn('OCR service not available, returning placeholder text');
            return 'OCR text extraction not available';
        }
    } catch (error) {
        console.error('OCR error:', error);
        return 'Error extracting text from image';
    }
}

export function arrayBuffer2Base64(buffer:Buffer){
    return Buffer.from(buffer).toString('base64');
}