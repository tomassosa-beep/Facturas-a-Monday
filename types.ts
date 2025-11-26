export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type ClassificationType = 'ALAU' | 'EXTERIOR' | 'NOTA DE CREDITO' | 'RENDICION';

export interface InvoiceData {
  fileName: string;
  status: ProcessingStatus;
  date?: string;           // Fecha de la factura
  dueDate?: string;        // Fecha de vencimiento
  receivedDate?: string;   // Fecha de recepción (Nuevo)
  vendor?: string;         // Proveedor
  invoiceNumber?: string;  // Número de factura
  purchaseOrder?: string;  // OC - Orden de Compra (Nuevo)
  totalAmount?: number;    // Total
  currency?: string;       // Moneda (USD, EUR, ARS, etc)
  exchangeRate?: number;   // TC FC - Tipo de Cambio (Nuevo)
  category?: string;       // Categoría interna (opcional)
  description?: string;    // Breve descripción
  classification?: ClassificationType; // Clasificación para Monday
  errorMessage?: string;
}

// Data structure expected from Gemini JSON response
export interface GeminiInvoiceResponse {
  date: string;
  dueDate: string;
  vendor: string;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  exchangeRate: number;
  purchaseOrder: string;
  category: string;
  description: string;
  isCreditNote: boolean;
}