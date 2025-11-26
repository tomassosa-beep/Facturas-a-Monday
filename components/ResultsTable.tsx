import React, { useState, useEffect } from 'react';
import { InvoiceData, ClassificationType } from '../types';
import { TrashIcon } from './Icons';

interface ExcelPreviewTableProps {
  invoices: InvoiceData[];
  onUpdate: (index: number, updates: Partial<InvoiceData>) => void;
  onRemove: (index: number) => void;
}

const CLASSIFICATION_OPTIONS: ClassificationType[] = [
  'ALAU',
  'RENDICION',
  'EXTERIOR',
  'NOTA DE CREDITO'
];

const ExcelPreviewTable: React.FC<ExcelPreviewTableProps> = ({ invoices, onUpdate, onRemove }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  
  // Bulk Edit States
  const [bulkReceivedDate, setBulkReceivedDate] = useState('');
  const [bulkExchangeRate, setBulkExchangeRate] = useState('');
  const [bulkOC, setBulkOC] = useState('');
  const [bulkClassification, setBulkClassification] = useState<ClassificationType | ''>('');

  if (invoices.length === 0) return null;

  // Selection Handlers
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIndices = new Set(invoices.map((_, idx) => idx));
      setSelectedIndices(allIndices);
    } else {
      setSelectedIndices(new Set());
    }
  };

  const toggleSelectRow = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  // Bulk Apply Handler
  const applyBulkEdit = () => {
    const updates: Partial<InvoiceData> = {};
    if (bulkReceivedDate) updates.receivedDate = bulkReceivedDate;
    if (bulkExchangeRate) updates.exchangeRate = parseFloat(bulkExchangeRate);
    if (bulkOC) updates.purchaseOrder = bulkOC;
    if (bulkClassification) updates.classification = bulkClassification;

    // Apply to all selected rows by calling onUpdate for each
    Array.from(selectedIndices).forEach(index => {
      onUpdate(index, updates);
    });
  };

  return (
    <div className="space-y-4">
      
      {/* BULK EDIT TOOLBAR */}
      {selectedIndices.size > 0 && (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-sm animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="text-sm font-semibold text-blue-400 whitespace-nowrap">
              Editando {selectedIndices.size} filas:
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Clasificación</label>
                <select
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                  value={bulkClassification}
                  onChange={(e) => setBulkClassification(e.target.value as ClassificationType)}
                >
                  <option value="">- Sin cambio -</option>
                  {CLASSIFICATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Recibido</label>
                <input 
                  type="date"
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                  value={bulkReceivedDate}
                  onChange={(e) => setBulkReceivedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">TC FC</label>
                <input 
                  type="number"
                  placeholder="Ej: 1100"
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500"
                  value={bulkExchangeRate}
                  onChange={(e) => setBulkExchangeRate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">OC</label>
                <input 
                  type="text"
                  placeholder="Ej: 4500-..."
                  className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 text-sm placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500"
                  value={bulkOC}
                  onChange={(e) => setBulkOC(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={applyBulkEdit}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-500 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-20 md:rounded-lg bg-slate-800 border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-3 text-left w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                    onChange={toggleSelectAll}
                    checked={invoices.length > 0 && selectedIndices.size === invoices.length}
                  />
                </th>
                <th scope="col" className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[150px]">Nombre del Item</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[120px]">Clasificación</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[130px]">Fecha FC</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[130px]">Fecha Vto</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider min-w-[130px] bg-yellow-900/10 border-l border-yellow-900/20">Recibido</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[100px]">N° Factura</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[100px] bg-slate-900/50 border-l border-slate-700">OC</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[80px] bg-slate-900/50">TC FC</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-blue-400 uppercase tracking-wider min-w-[100px] bg-blue-900/10 border-l border-blue-900/20">Importe ARS</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-green-400 uppercase tracking-wider min-w-[100px] bg-green-900/10 border-l border-green-900/20">Importe USD</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[150px]">PDF</th>
                <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-800">
              {invoices.map((invoice, idx) => {
                const isARS = invoice.currency === 'ARS';
                const amountARS = isARS ? invoice.totalAmount : '';
                const amountUSD = !isARS ? invoice.totalAmount : '';
                const isSelected = selectedIndices.has(idx);

                return (
                  <tr key={`${invoice.fileName}-${idx}`} className={`hover:bg-slate-700/50 transition-colors ${isSelected ? 'bg-blue-900/20' : ''}`}>
                    {/* CHECKBOX */}
                    <td className="pl-4 pr-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(idx)}
                      />
                    </td>

                    {/* NOMBRE DEL ITEM */}
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
                        value={invoice.vendor || ''}
                        onChange={(e) => onUpdate(idx, { vendor: e.target.value })}
                      />
                    </td>

                    {/* CLASIFICACION */}
                    <td className="px-2 py-2">
                      <select
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 pl-3 pr-8 focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
                        value={invoice.classification || 'ALAU'}
                        onChange={(e) => onUpdate(idx, { classification: e.target.value as ClassificationType })}
                      >
                        {CLASSIFICATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>

                    {/* FECHA FC */}
                    <td className="px-2 py-2">
                      <input 
                        type="date" 
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
                        value={invoice.date || ''}
                        onChange={(e) => onUpdate(idx, { date: e.target.value })}
                      />
                    </td>

                    {/* FECHA VTO */}
                    <td className="px-2 py-2">
                      <input 
                        type="date" 
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
                        value={invoice.dueDate || ''}
                        onChange={(e) => onUpdate(idx, { dueDate: e.target.value })}
                      />
                    </td>

                    {/* RECIBIDO (Nuevo) */}
                    <td className="px-2 py-2 bg-yellow-900/10 border-l border-yellow-900/20">
                      <input 
                        type="date" 
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm sm:leading-6"
                        value={invoice.receivedDate || ''}
                        onChange={(e) => onUpdate(idx, { receivedDate: e.target.value })}
                      />
                    </td>

                    {/* N FACTURA */}
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
                        value={invoice.invoiceNumber || ''}
                        onChange={(e) => onUpdate(idx, { invoiceNumber: e.target.value })}
                      />
                    </td>

                    {/* OC (Nuevo) */}
                    <td className="px-2 py-2 bg-slate-900/30 border-l border-slate-700">
                      <input 
                        type="text" 
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
                        value={invoice.purchaseOrder || ''}
                        onChange={(e) => onUpdate(idx, { purchaseOrder: e.target.value })}
                      />
                    </td>

                    {/* TC FC (Nuevo) */}
                    <td className="px-2 py-2 bg-slate-900/30">
                      <input 
                        type="number" 
                        placeholder="-"
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6 text-right placeholder-slate-600"
                        value={invoice.exchangeRate || ''}
                        onChange={(e) => onUpdate(idx, { exchangeRate: parseFloat(e.target.value) })}
                      />
                    </td>

                    {/* IMPORTE ARS */}
                    <td className="px-2 py-2 bg-blue-900/10 border-l border-blue-900/20">
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6 text-right placeholder-slate-600"
                        value={amountARS || ''}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdate(idx, { totalAmount: isNaN(val) ? 0 : val, currency: 'ARS' });
                        }}
                      />
                    </td>

                    {/* IMPORTE USD */}
                    <td className="px-2 py-2 bg-green-900/10 border-l border-green-900/20">
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="block w-full rounded-md border-slate-600 bg-slate-900 text-white py-1.5 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm sm:leading-6 text-right placeholder-slate-600"
                        value={amountUSD || ''}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdate(idx, { totalAmount: isNaN(val) ? 0 : val, currency: 'USD' });
                        }}
                      />
                    </td>

                    {/* PDF (Read Only) */}
                    <td className="px-3 py-4 text-xs text-slate-400 max-w-[150px] truncate" title={invoice.fileName}>
                      {invoice.fileName}
                    </td>

                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => onRemove(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar fila"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreviewTable;