import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Dropzone from './components/Dropzone';
import ExcelPreviewTable from './components/ResultsTable';
import ProcessingList from './components/ProcessingList';
import { extractInvoiceData } from './services/geminiService';
import { InvoiceData, ProcessingStatus } from './types';
import { CheckCircleIcon } from './components/Icons';

type AppStep = 'UPLOAD' | 'PREVIEW' | 'DOWNLOAD';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [step, setStep] = useState<AppStep>('UPLOAD');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to reset app
  const resetApp = () => {
    setInvoices([]);
    setStep('UPLOAD');
    setIsProcessing(false);
  };

  const processFiles = async (filesToProcess: File[]) => {
    setIsProcessing(true);
    
    const today = new Date().toISOString().split('T')[0];

    // Add initial placeholders
    const newInvoices: InvoiceData[] = filesToProcess.map(file => ({
      fileName: file.name,
      status: ProcessingStatus.PENDING,
      classification: 'ALAU', // Default
      receivedDate: today, // Initialize with today's date
      exchangeRate: undefined, // Empty by default unless found
      purchaseOrder: '' // Empty by default
    }));

    // If we are adding to existing list
    const startIndex = invoices.length;
    setInvoices(prev => [...prev, ...newInvoices]);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const currentIndex = startIndex + i;

      // Update status to processing
      setInvoices(prev => prev.map((inv, idx) => 
        idx === currentIndex ? { ...inv, status: ProcessingStatus.PROCESSING } : inv
      ));

      try {
        const data = await extractInvoiceData(file);
        
        // Auto-detect classification
        const classification = data.isCreditNote ? 'NOTA DE CREDITO' : 'ALAU';

        setInvoices(prev => prev.map((inv, idx) => 
          idx === currentIndex ? { 
            ...inv, 
            status: ProcessingStatus.COMPLETED,
            ...data,
            classification: classification
          } : inv
        ));
      } catch (error) {
        setInvoices(prev => prev.map((inv, idx) => 
          idx === currentIndex ? { 
            ...inv, 
            status: ProcessingStatus.ERROR, 
            errorMessage: "Fallo al procesar" 
          } : inv
        ));
      }
    }
    
    setIsProcessing(false);
  };

  const handleFilesSelected = (files: File[]) => {
    processFiles(files);
  };

  const handleGoToPreview = () => {
    setStep('PREVIEW');
  };

  const handleConfirmPreview = () => {
    setStep('DOWNLOAD');
  };

  const handleUpdateInvoice = (index: number, updates: Partial<InvoiceData>) => {
    setInvoices(prev => prev.map((inv, i) => i === index ? { ...inv, ...updates } : inv));
  };

  const handleDownloadAndReset = () => {
    const exportData = invoices
      .filter(inv => inv.status === ProcessingStatus.COMPLETED)
      .map(inv => {
        const isARS = inv.currency === 'ARS';
        
        return {
          "Nombre del item": inv.vendor || "Factura",
          "Clasificacion": inv.classification,
          "Fecha de FC": inv.date || "",
          "Fecha de vencimiento": inv.dueDate || "",
          "Recibido": inv.receivedDate || "",
          "N de factura": inv.invoiceNumber || "",
          "OC": inv.purchaseOrder || "",
          "TC FC": inv.exchangeRate || "",
          "Importe en ARS": isARS ? inv.totalAmount : 0,
          "Importe en USD": !isARS ? inv.totalAmount : 0,
          "PDF": inv.fileName
        };
      });

    if (exportData.length === 0) {
      alert("No hay datos válidos para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monday Import");
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Reporte_Gastos_${dateStr}.xlsx`);

    // Reset app after short delay
    setTimeout(() => {
      resetApp();
    }, 1000);
  };

  // Derived state
  const completedCount = invoices.filter(i => i.status === ProcessingStatus.COMPLETED).length;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-100">
      <header className="bg-slate-800 shadow-lg border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-900/50 shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Factura a Monday</h1>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            {step === 'UPLOAD' && "Paso 1: Carga y Procesamiento"}
            {step === 'PREVIEW' && "Paso 2: Revisión de Excel"}
            {step === 'DOWNLOAD' && "Paso 3: Descarga"}
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* STEP 1: UPLOAD & PROCESSING */}
        {step === 'UPLOAD' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <Dropzone onFilesSelected={handleFilesSelected} />
            
            {invoices.length > 0 && (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                  <h2 className="font-semibold text-slate-200">Estado del Procesamiento</h2>
                  <span className="text-sm text-slate-400">{completedCount} / {invoices.length} completados</span>
                </div>
                
                <ProcessingList invoices={invoices} />

                <div className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end">
                   <button
                    onClick={handleGoToPreview}
                    disabled={isProcessing || completedCount === 0}
                    className={`
                      inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-all
                      ${!isProcessing && completedCount > 0
                        ? 'bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {isProcessing ? 'Procesando...' : 'Continuar a Vista Previa'}
                    {!isProcessing && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-2 w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PREVIEW & EDIT */}
        {step === 'PREVIEW' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Vista Previa del Excel</h2>
                <p className="text-slate-400 mt-1">Edita los campos directamente en la tabla antes de exportar.</p>
              </div>
              <button
                onClick={handleConfirmPreview}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5"
              >
                <CheckCircleIcon />
                <span className="ml-2">OK - Confirmar Excel</span>
              </button>
            </div>

            <ExcelPreviewTable 
              invoices={invoices} 
              onUpdate={handleUpdateInvoice} 
              onRemove={(idx) => setInvoices(prev => prev.filter((_, i) => i !== idx))}
            />
            
            <div className="flex justify-start">
               <button onClick={() => setStep('UPLOAD')} className="text-slate-400 hover:text-slate-200 text-sm underline">
                 &larr; Volver a cargar más archivos
               </button>
            </div>
          </div>
        )}

        {/* STEP 3: DOWNLOAD */}
        {step === 'DOWNLOAD' && (
           <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in fade-in duration-500">
              <div className="bg-green-900/20 p-6 rounded-full border border-green-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold text-white">¡Todo listo!</h2>
                <p className="mt-4 text-slate-400 text-lg">
                  Tu archivo Excel ha sido generado con {completedCount} facturas. 
                  Al descargarlo, la aplicación se reiniciará para una nueva carga.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                  onClick={handleDownloadAndReset}
                  className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                >
                  <svg className="-ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Descargar Excel
                </button>
                
                <button
                  onClick={resetApp}
                  className="w-full text-center text-slate-500 hover:text-slate-300 text-sm font-medium"
                >
                  Cancelar y volver al inicio
                </button>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;