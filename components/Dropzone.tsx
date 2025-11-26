import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon, FolderIcon } from './Icons';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

// Helper to check file types safely
const isValidFile = (file: File) => {
  const type = file.type;
  const name = file.name.toLowerCase();
  return type.startsWith('image/') || type === 'application/pdf' || name.endsWith('.pdf') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');
};

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(isValidFile);
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(isValidFile);
      if (files.length > 0) {
        onFilesSelected(files);
      } else {
        alert("No se encontraron archivos PDF o imágenes en la selección.");
      }
    }
    // Reset inputs to allow selecting same folder/files again
    e.target.value = '';
  }, [onFilesSelected]);

  const handleFolderClick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-900/20' 
            : 'border-slate-600 hover:border-blue-500 bg-slate-800'
          }
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        
        {/* Input específico para carpetas */}
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFileInput}
          className="hidden"
          id="folder-upload"
          {...{ webkitdirectory: "", directory: "" } as any} 
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadIcon />
          
          <div className="space-y-1">
             <p className="text-lg font-medium text-slate-200">
              Arrastra archivos o carpetas aquí
            </p>
             <p className="text-sm text-slate-400">
              Soporta PDF, JPG, PNG
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Seleccionar Archivos
            </label>
            
            <button 
              type="button"
              onClick={handleFolderClick}
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="mr-2"><FolderIcon /></span>
              Seleccionar Carpeta
            </button>
          </div>
          
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tip: Para procesar una carpeta de Google Drive, selecciónala desde tu disco local sincronizado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;