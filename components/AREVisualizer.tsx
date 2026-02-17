
import React from 'react';
import { AREStep } from '../types';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';

interface AREVisualizerProps {
  steps: AREStep[];
  onClose: () => void;
}

const AREVisualizer: React.FC<AREVisualizerProps> = ({ steps, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="bg-amber-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Apuração de Resultado (ARE)</h2>
            <p className="text-amber-100 font-medium">Visualização passo a passo do encerramento de contas.</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {steps.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Info size={48} className="mx-auto mb-4 opacity-20" />
              <p className="italic">Nenhum movimento de resultado para apurar.</p>
            </div>
          ) : (
            steps.map((step, idx) => (
              <div key={idx} className="relative pl-12 border-l-2 border-slate-100 last:border-0 pb-4">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                  {idx + 1}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{step.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.entries.map((entry, eIdx) => (
                    <div key={eIdx} className={`p-4 rounded-2xl border transition-all ${
                      entry.type === 'DEBIT' ? 'bg-blue-50/50 border-blue-100' : 'bg-amber-50/50 border-amber-100'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          entry.type === 'DEBIT' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {entry.type === 'DEBIT' ? 'Débito' : 'Crédito'}
                        </span>
                        <span className="font-black text-slate-900">R$ {entry.amount.toLocaleString()}</span>
                      </div>
                      <div className="font-bold text-slate-800 text-sm mb-1">{entry.accountName}</div>
                      <div className="text-[11px] text-slate-400 italic">{entry.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-emerald-800">
            <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />
            <div>
              <h4 className="font-black">Ciclo Completo!</h4>
              <p className="text-sm opacity-80">As contas de Receita e Despesa foram zeradas. O saldo do exercício agora reside oficialmente no Patrimônio Líquido.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AREVisualizer;
