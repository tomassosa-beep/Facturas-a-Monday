import React from 'react';
import { InvoiceData, ProcessingStatus } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, SpinnerIcon } from './Icons';

interface ProcessingListProps {
  invoices: InvoiceData[];
}

const ProcessingList: React.FC<ProcessingListProps> = ({ invoices }) => {
  return (
    <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-700">
      {invoices.map((invoice, idx) => (
        <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0">
               {invoice.status === ProcessingStatus.PROCESSING && <SpinnerIcon />}
               {invoice.status === ProcessingStatus.COMPLETED && <CheckCircleIcon />}
               {invoice.status === ProcessingStatus.ERROR && <ExclamationCircleIcon />}
               {invoice.status === ProcessingStatus.PENDING && (
                 <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>
               )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-200 truncate pr-4" title={invoice.fileName}>
                {invoice.fileName}
              </span>
              {invoice.status === ProcessingStatus.ERROR && (
                 <span className="text-xs text-red-400">Error al leer</span>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {invoice.status === ProcessingStatus.COMPLETED ? 'OK' : 
             invoice.status === ProcessingStatus.PROCESSING ? 'Leyendo...' : 
             invoice.status === ProcessingStatus.ERROR ? 'Fallo' : 'Pendiente'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProcessingList;