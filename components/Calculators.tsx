
import React, { useState } from 'react';
import { Calculator, Zap, History, Scale, ShieldCheck, Leaf, Heart, AlertCircle, Info } from 'lucide-react';

const Calculators: React.FC = () => {
  // DEA States
  const [assetValue, setAssetValue] = useState(100000);
  const [residualValue, setResidualValue] = useState(10000);
  const [usefulLife, setUsefulLife] = useState(10);
  
  // ESG Simulator States
  const [cleanEnergy, setCleanEnergy] = useState(50);
  const [diversity, setDiversity] = useState(30);
  const [transparency, setTransparency] = useState(true);

  const depreciation = (assetValue - residualValue) / usefulLife;
  
  const esgSimScore = Math.round(
    (cleanEnergy * 0.4) + 
    (diversity * 0.4) + 
    (transparency ? 20 : 0)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DEA Calculator */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Calculadora DEA</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Depreciação, Exaustão e Amortização</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor de Custo (R$)</label>
              <input 
                type="number" 
                value={assetValue} 
                onChange={(e) => setAssetValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor Residual (R$)</label>
                <input 
                  type="number" 
                  value={residualValue} 
                  onChange={(e) => setResidualValue(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vida Útil (Anos)</label>
                <input 
                  type="number" 
                  value={usefulLife} 
                  onChange={(e) => setUsefulLife(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quota de Depreciação</span>
                <Info size={14} className="text-slate-500" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-black font-mono">R$ {depreciation.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Por Ano</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono">R$ {(depreciation / 12).toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Por Mês</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ESG Simulator */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-white border border-white/5 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-900/40">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black">Simulador de Score ESG</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Previsão de Impacto não Financeiro</p>
            </div>
          </div>

          <div className="space-y-8 flex-1">
            <div>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                  <Leaf size={14} /> Energia Limpa (%)
                </div>
                <span className="font-mono font-black">{cleanEnergy}%</span>
              </div>
              <input 
                type="range" 
                value={cleanEnergy} 
                onChange={(e) => setCleanEnergy(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  <Heart size={14} /> Diversidade (%)
                </div>
                <span className="font-mono font-black">{diversity}%</span>
              </div>
              <input 
                type="range" 
                value={diversity} 
                onChange={(e) => setDiversity(Number(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button 
              onClick={() => setTransparency(!transparency)}
              className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                transparency ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Transparência do Conselho</span>
              </div>
              <div className={`w-4 h-4 rounded-full ${transparency ? 'bg-amber-500' : 'bg-slate-700'}`} />
            </button>

            <div className="mt-4 p-8 bg-white/5 border border-white/5 rounded-[2rem] text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Previsão Score Global</div>
              <div className={`text-6xl font-black mb-2 ${esgSimScore > 70 ? 'text-emerald-400' : esgSimScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                {esgSimScore}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed">
                Este valor é uma projeção. Realize lançamentos nas contas ESG para oficializar o score.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-center gap-4 text-indigo-800">
        <AlertCircle size={24} className="text-indigo-500 shrink-0" />
        <p className="text-xs font-medium leading-relaxed">
          <strong>Dica do Professor:</strong> Os cálculos acima são ferramentas de auxílio para o planejamento. No SimuContas, a Depreciação oficial deve ser lançada via Diário utilizando as contas 5.1.05 (Despesa) e 1.2.02 (Depreciação Acumulada).
        </p>
      </div>
    </div>
  );
};

export default Calculators;
