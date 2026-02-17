
import React, { useState } from 'react';
import { 
  TrendingUp, Wallet, Zap, Briefcase, BarChart3, Target, ArrowUpRight, ArrowDownRight, 
  Scale, ShieldCheck, Leaf, Heart, Award, Sparkles, Loader2, ChevronDown, ChevronUp, 
  BookText, RefreshCw, Copy, Check
} from 'lucide-react';
import { FinancialRatios, ESGMetrics } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, 
  Area, CartesianGrid
} from 'recharts';

interface DashboardProps {
  ratios: FinancialRatios;
  esg: ESGMetrics;
  revenue: number;
  expenses: number;
  cmv: number;
  aiAnalysis: string | null;
  onGenerateAnalysis: () => void;
  isAnalyzing: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  ratios, esg, revenue, expenses, cmv, aiAnalysis, onGenerateAnalysis, isAnalyzing 
}) => {
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const esgPillars = [
    { name: 'Ambiental', score: esg.environmental, icon: Leaf, color: '#10b981', bg: 'bg-emerald-500/10', desc: 'Sustentabilidade' },
    { name: 'Social', score: esg.social, icon: Heart, color: '#3b82f6', bg: 'bg-blue-500/10', desc: 'Impacto Humano' },
    { name: 'Governança', score: esg.governance, icon: ShieldCheck, color: '#f59e0b', bg: 'bg-amber-500/10', desc: 'Ética & Gestão' },
  ];

  const financialData = [
    { name: 'Q1', val: revenue * 0.2 },
    { name: 'Q2', val: revenue * 0.45 },
    { name: 'Q3', val: revenue * 0.75 },
    { name: 'Hoje', val: revenue },
  ];

  const grossMarginData = [
    { name: 'Margem Bruta', 'Receita Bruta': revenue, 'CMV': cmv },
  ];

  const netMarginComparisonData = [
    { name: 'Margem Líquida', 'Receita Bruta': revenue, 'Despesas Totais': expenses },
  ];

  const handleCopy = () => {
    if (aiAnalysis) {
      navigator.clipboard.writeText(aiAnalysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const overallScore = Math.round((esg.environmental + esg.social + esg.governance) / 3);

  // Data for the stacked bar representing the overall score
  // Each segment contributes 1/3 to the total potential 100%
  const stackedEsgData = [
    {
      name: 'Score Global',
      Ambiental: esg.environmental / 3,
      Social: esg.social / 3,
      Governança: esg.governance / 3,
      Restante: 100 - overallScore
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* AI Analysis Section (Notas Explicativas) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden transition-all duration-500">
        <div 
          className="px-8 py-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">IA: Notas Explicativas do Exercício</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Análise de Elite & Recomendações Estratégicas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateAnalysis();
              }}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {aiAnalysis ? 'Atualizar Análise' : 'Gerar Relatório IA'}
            </button>
            {isAnalysisExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </div>
        </div>
        
        {isAnalysisExpanded && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-4 duration-500">
            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
                <p className="text-slate-500 font-bold animate-pulse uppercase text-[10px] tracking-widest">O Mentor Contábil está revisando as partidas...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="relative">
                <button 
                  onClick={handleCopy}
                  className="absolute right-4 top-4 p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest z-10"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm leading-relaxed text-slate-700 font-medium overflow-auto">
                   {aiAnalysis.split('\n').map((line, i) => {
                     const trimmed = line.trim();
                     if (trimmed.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-slate-800 mt-8 mb-4 border-b-4 border-indigo-500 inline-block pb-1">{trimmed.replace('# ', '')}</h1>;
                     if (trimmed.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-slate-800 mt-6 mb-3">{trimmed.replace('## ', '')}</h2>;
                     if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return <li key={i} className="ml-4 mb-2 list-disc list-inside text-slate-600 font-bold">{trimmed.substring(2)}</li>;
                     if (trimmed === '') return <div key={i} className="h-4" />;
                     return <p key={i} className="mb-4">{trimmed}</p>;
                   })}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <BookText size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 italic">Clique em "Gerar Relatório IA" para obter notas explicativas baseadas nos seus números atuais.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
                 <BarChart3 size={24} className="text-indigo-500" /> Evolução Financeira
               </h3>
               <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest">Dados Consolidados</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                  <Tooltip cursor={{stroke: '#6366f1', strokeWidth: 2}} />
                  <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="text-lg font-black flex items-center gap-3 text-slate-800 mb-6">
                <Scale size={20} className="text-emerald-500" /> Eficiência Operacional
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grossMarginData} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Bar name="Receita Bruta" dataKey="Receita Bruta" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar name="CMV" dataKey="CMV" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="text-lg font-black flex items-center gap-3 text-slate-800 mb-6">
                <TrendingUp size={20} className="text-amber-500" /> Resultado Líquido
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={netMarginComparisonData} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Bar name="Receita Bruta" dataKey="Receita Bruta" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar name="Despesas Totais" dataKey="Despesas Totais" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Improved ESG Scorecard with Stacked Bar Visualization */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col h-full border border-white/5">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-3">
              <Award size={24} className="text-emerald-400" />
              <h3 className="text-xl font-black tracking-tight">Métricas ESG</h3>
            </div>
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">Relatório</div>
          </div>

          <div className="flex-1 space-y-10 relative z-10">
            {/* Overall Score Section with requested Stacked Bar */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-5xl font-black text-white">{overallScore}</span>
                  <span className="text-slate-500 text-xs font-black uppercase tracking-widest ml-2">Score Global</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black uppercase text-emerald-400 tracking-tighter">Desempenho</span>
                  <span className="text-xs text-slate-400 font-bold italic">Baseado em 100pts</span>
                </div>
              </div>
              
              {/* Stacked Bar for Overall Score */}
              <div className="h-12 w-full bg-white/5 rounded-2xl overflow-hidden flex shadow-inner border border-white/5">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out flex items-center justify-center text-[9px] font-black overflow-hidden" 
                  style={{ width: `${esg.environmental / 3}%` }} 
                  title={`Ambiental: ${esg.environmental}% (Contribui com ${(esg.environmental/3).toFixed(1)} pts)`}
                >
                  {esg.environmental > 15 && <Leaf size={12} className="opacity-50" />}
                </div>
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-center text-[9px] font-black overflow-hidden" 
                  style={{ width: `${esg.social / 3}%` }} 
                  title={`Social: ${esg.social}% (Contribui com ${(esg.social/3).toFixed(1)} pts)`}
                >
                  {esg.social > 15 && <Heart size={12} className="opacity-50" />}
                </div>
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000 ease-out flex items-center justify-center text-[9px] font-black overflow-hidden" 
                  style={{ width: `${esg.governance / 3}%` }} 
                  title={`Governança: ${esg.governance}% (Contribui com ${(esg.governance/3).toFixed(1)} pts)`}
                >
                  {esg.governance > 15 && <ShieldCheck size={12} className="opacity-50" />}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Pillar Breakdown with Composite Bar */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5 pb-2">Composição por Pilar</h4>
              {esgPillars.map((pillar, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`${pillar.bg} p-2.5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform`}>
                        <pillar.icon size={18} style={{ color: pillar.color }} />
                      </div>
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest block">{pillar.name}</span>
                         <span className="text-[9px] text-slate-500 font-bold">{pillar.desc}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-lg font-black" style={{ color: pillar.color }}>{pillar.score}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${pillar.score}%`, backgroundColor: pillar.color, boxShadow: `0 0 10px ${pillar.color}40` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-600/10 rounded-[2rem] p-6 border border-indigo-500/20 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <span>Impacto Financeiro</span>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(100, (revenue / (expenses || 1)) * 10)}%` }} />
                  </div>
                  <span className="text-xs font-black text-indigo-200">ROI ESG</span>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 relative z-10 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic leading-relaxed">
              "Responsabilidade Social é o novo Ativo Intangível."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
