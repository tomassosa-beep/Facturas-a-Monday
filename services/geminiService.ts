import { GoogleGenAI, Type } from "@google/genai";
import { GeminiInvoiceResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractInvoiceData = async (file: File): Promise<GeminiInvoiceResponse> => {
  try {
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analiza esta factura. Extrae los siguientes datos con precisión.
            
            Si algún dato no es visible, intenta inferirlo o déjalo vacío.
            
            Devuelve un JSON con la siguiente estructura:
            - date: Fecha de emisión de la factura (YYYY-MM-DD).
            - dueDate: Fecha de vencimiento de la factura (YYYY-MM-DD). Si no hay, usa la fecha de emisión.
            - vendor: Nombre de la empresa o proveedor.
            - invoiceNumber: Número de factura.
            - purchaseOrder: Número de Orden de Compra (OC / PO) si aparece.
            - totalAmount: El monto total numérico (sin símbolos).
            - currency: Código de moneda ISO (USD, ARS, EUR, etc). Si es pesos argentinos, usa 'ARS'.
            - exchangeRate: Tipo de Cambio (T.C.) si aparece explícitamente en la factura.
            - description: Breve descripción del ítem o servicio.
            - isCreditNote: BOOLEAN. 'true' si el documento dice explícitamente "Nota de Crédito" o "Credit Note", de lo contrario 'false'.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            vendor: { type: Type.STRING },
            invoiceNumber: { type: Type.STRING },
            purchaseOrder: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            exchangeRate: { type: Type.NUMBER },
            description: { type: Type.STRING },
            isCreditNote: { type: Type.BOOLEAN },
          },
          required: ["vendor", "totalAmount", "currency"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiInvoiceResponse;
    }
    
    throw new Error("No se pudo extraer información del modelo.");

  } catch (error) {
    console.error("Error procesando factura con Gemini:", error);
    throw error;
  }
};