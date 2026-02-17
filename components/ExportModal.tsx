
import React from 'react';
import { X, FileJson, FileText, Table, Check, Download } from 'lucide-react';
import { ExportFormat } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  reportName: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, reportName }) => {
  if (!isOpen) return null;

  const options = [
    { id: 'PDF', label: 'Documento PDF', desc: 'Relatório formatado pronto para impressão.', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'CSV', label: 'Planilha CSV', desc: 'Dados brutos para Excel ou Google Sheets.', icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'JSON', label: 'Arquivo JSON', desc: 'Estrutura de dados original (Desenvolvedores).', icon: FileJson, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Exportar</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{reportName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onExport(opt.id as ExportFormat)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group"
              >
                <div className={`${opt.bg} ${opt.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <opt.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-slate-800">{opt.label}</div>
                  <div className="text-[10px] font-medium text-slate-400">{opt.desc}</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download size={16} className="text-indigo-600" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={onClose} className="py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
            <div className="bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-tighter text-slate-300">Selecione uma opção</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
