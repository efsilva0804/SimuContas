
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JournalEntryForm from './components/JournalEntryForm';
import TAccount from './components/TAccount';
import AREVisualizer from './components/AREVisualizer';
import ExportModal from './components/ExportModal';
import Calculators from './components/Calculators';
import { Account, Transaction, AccountType, FinancialReport, AREStep, TransactionType, ESGCategory, ExportFormat } from './types';
import { INITIAL_ACCOUNTS } from './constants';
import { AccountingEngine } from './services/accountingEngine';
import { GeminiService } from './services/geminiService';
import { 
  Sparkles, Loader2, BookOpen, ShieldCheck, CheckCircle, Info, Menu, X, 
  Wand2, FileText, Scale, ArrowDownCircle, MoveDown, CalendarDays, PlusCircle, 
  TrendingUp, Landmark, ArrowRightLeft, Table, RefreshCw, Search, Filter, XCircle, Calendar,
  Printer, FileDown, Download, Leaf, Heart, Award
} from 'lucide-react';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [areSteps, setAreSteps] = useState<AREStep[] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [journalFilterType, setJournalFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [journalDateStart, setJournalDateStart] = useState('');
  const [journalDateEnd, setJournalDateEnd] = useState('');

  const gemini = useMemo(() => new GeminiService(), []);

  // Relatório consolidado do exercício selecionado
  const currentReport: FinancialReport = useMemo(() => 
    AccountingEngine.generateReport(accounts, transactions, selectedYear), 
    [accounts, transactions, selectedYear]
  );

  const handleAddTransaction = (tx: Transaction) => {
    const newTx = { ...tx, period: currentYear, type: TransactionType.OPERATIONAL };
    const newTransactions = [...transactions, newTx];
    setTransactions(newTransactions);
    const updatedAccounts = AccountingEngine.updateBalances(accounts, newTransactions);
    setAccounts(updatedAccounts);
    setAiFeedback(null);
  };

  const handleGenerateSamples = async () => {
    setIsGeneratingSamples(true);
    const samples = await gemini.generateSampleTransactions(accounts);
    
    if (samples && samples.length > 0) {
      const formattedSamples = samples.map((s: any, i: number) => ({
        ...s,
        id: `sample-${Date.now()}-${i}`,
        period: currentYear,
        type: TransactionType.OPERATIONAL
      }));
      
      const newTransactions = [...transactions, ...formattedSamples];
      setTransactions(newTransactions);
      const updatedAccounts = AccountingEngine.updateBalances(accounts, newTransactions);
      setAccounts(updatedAccounts);
      setAiFeedback(`IA: Gerados fatos contábeis para o exercício ${currentYear}.`);
    }
    
    setIsGeneratingSamples(false);
  };

  const handleGenerateAIAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const analysis = await gemini.analyzeFinancials(currentReport);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error(err);
      setAiAnalysis("Falha ao gerar análise. Verifique sua conexão.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleARE = () => {
    const periodReport = AccountingEngine.generateReport(accounts, transactions, currentYear);
    const { steps, closingTransaction } = AccountingEngine.performARE(periodReport.accounts, currentYear);
    
    if (closingTransaction) {
      const newTransactions = [...transactions, closingTransaction];
      setTransactions(newTransactions);
      const updatedAccounts = AccountingEngine.updateBalances(accounts, newTransactions);
      setAccounts(updatedAccounts);
      
      setAiFeedback(`Exercício ${currentYear} encerrado. Clique no "+" acima para abrir ${currentYear + 1}.`);
      setAiAnalysis(null);
    }
    setAreSteps(steps);
  };

  const handleNewExercise = () => {
    const nextYear = currentYear + 1;
    setCurrentYear(nextYear);
    setSelectedYear(nextYear);
    setAiFeedback(`Iniciado o Exercício Social de ${nextYear}. O Diário está limpo para novos lançamentos.`);
    setAiAnalysis(null);
  };

  const handleGetAIHelp = async (desc: string) => {
    setAiFeedback("Consultando mentor contábil...");
    const feedback = await gemini.getEntryFeedback(desc, accounts);
    setAiFeedback(feedback || "Dica não disponível.");
  };

  const handleExport = (format: ExportFormat) => {
    setIsExportModalOpen(false);
    if (format === 'PDF') {
      window.print();
      return;
    }

    const data = currentReport;
    const blob = new Blob([format === 'JSON' ? JSON.stringify(data, null, 2) : 'DRE,Valor\nReceita,' + data.revenue + '\nDespesas,' + data.expenses], { type: format === 'JSON' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${selectedYear}.${format.toLowerCase()}`;
    a.click();
  };

  const availableYears = Array.from(new Set([2024, currentYear, ...transactions.map(t => t.period)])).sort();

  // Filtered Lists
  const filteredLedgerAccounts = useMemo(() => {
    const query = ledgerSearch.toLowerCase();
    return INITIAL_ACCOUNTS.filter(a => a.code !== '3.1.99' && (
      a.name.toLowerCase().includes(query) || a.code.toLowerCase().includes(query)
    ));
  }, [ledgerSearch]);

  const filteredJournalTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.period === selectedYear);
    
    if (journalFilterType !== 'ALL') {
      filtered = filtered.filter(t => t.type === journalFilterType);
    }

    if (journalDateStart) {
      const start = new Date(journalDateStart);
      filtered = filtered.filter(t => new Date(t.date) >= start);
    }

    if (journalDateEnd) {
      const end = new Date(journalDateEnd);
      filtered = filtered.filter(t => new Date(t.date) <= end);
    }

    return filtered.slice().reverse();
  }, [transactions, selectedYear, journalFilterType, journalDateStart, journalDateEnd]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onARE={handleARE} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {areSteps && <AREVisualizer steps={areSteps} onClose={() => setAreSteps(null)} />}
      
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExport}
        reportName={currentView === 'esg' ? 'Métricas ESG' : 'Demonstrações Financeiras'}
      />

      <main className={`flex-1 transition-all duration-300 p-8 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start gap-6 no-print">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 sidebar-trigger"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight capitalize mb-1">{currentView === 'esg' ? 'Métricas ESG' : currentView}</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase flex items-center gap-1 shadow-sm">
                  <CalendarDays size={10} /> Exercício Atual: {currentYear}
                </span>
                <span className="text-slate-400 text-xs font-medium italic">Simulador Educacional de Gestão Contábil</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
                <span className="text-[10px] font-black uppercase text-slate-400 px-2">Anos:</span>
                {availableYears.map(y => (
                  <button 
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedYear === y ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {y}
                  </button>
                ))}
                <button 
                  onClick={handleNewExercise}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all hover:scale-110 active:scale-90"
                  title="Abrir Novo Exercício"
                >
                  <PlusCircle size={22} />
                </button>
             </div>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Dashboard 
              ratios={currentReport.ratios} 
              esg={currentReport.esg} 
              revenue={currentReport.revenue} 
              expenses={currentReport.expenses} 
              cmv={currentReport.cmv}
              aiAnalysis={aiAnalysis}
              onGenerateAnalysis={handleGenerateAIAnalysis}
              isAnalyzing={isLoadingAnalysis}
            />
          </div>
        )}

        {currentView === 'calculators' && <Calculators />}

        {currentView === 'esg' && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex justify-end no-print">
               <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
               >
                 <Download size={16} /> Exportar ESG
               </button>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl">
                <Leaf size={32} className="mb-4 opacity-50" />
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Ambiental</h3>
                <p className="text-4xl font-black mt-2">{currentReport.esg.environmental}%</p>
                <div className="mt-4 text-[10px] font-medium leading-relaxed opacity-90">Investimentos em infraestrutura limpa e gestão de recursos.</div>
              </div>
              <div className="bg-blue-500 p-8 rounded-[2.5rem] text-white shadow-xl">
                <Heart size={32} className="mb-4 opacity-50" />
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Social</h3>
                <p className="text-4xl font-black mt-2">{currentReport.esg.social}%</p>
                <div className="mt-4 text-[10px] font-medium leading-relaxed opacity-90">Bem-estar dos colaboradores e impacto na comunidade.</div>
              </div>
              <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl">
                <ShieldCheck size={32} className="mb-4 opacity-50" />
                <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Governança</h3>
                <p className="text-4xl font-black mt-2">{currentReport.esg.governance}%</p>
                <div className="mt-4 text-[10px] font-medium leading-relaxed opacity-90">Transparência, ética e conformidade regulatória.</div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <Award className="text-indigo-500" /> Detalhamento de Contas ESG
              </h3>
              <div className="space-y-6">
                {[ESGCategory.ENVIRONMENTAL, ESGCategory.SOCIAL, ESGCategory.GOVERNANCE].map(cat => {
                  const catAccounts = currentReport.accounts.filter(a => a.esgCategory === cat);
                  return (
                    <div key={cat} className="border-b border-slate-100 last:border-0 pb-6 mb-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{cat}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catAccounts.map(acc => (
                          <div key={acc.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                              <span className="block font-bold text-slate-700 text-sm">{acc.name}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{acc.code}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-black ${acc.balance > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>R$ {acc.balance.toLocaleString()}</span>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase">Saldo Atual</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentView === 'journal' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1 flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm no-print">
                 <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                   <Filter size={16} className="text-slate-400" />
                   <select 
                    value={journalFilterType}
                    onChange={(e) => setJournalFilterType(e.target.value as any)}
                    className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none"
                   >
                     <option value="ALL">TODOS TIPOS</option>
                     <option value={TransactionType.OPERATIONAL}>OPERACIONAL</option>
                     <option value={TransactionType.CLOSING}>ENCERRAMENTO</option>
                   </select>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-400" />
                    <input 
                      type="date" 
                      value={journalDateStart} 
                      onChange={(e) => setJournalDateStart(e.target.value)}
                      className="bg-slate-50 text-[10px] font-bold p-2 rounded-lg border border-slate-100 outline-none"
                    />
                    <span className="text-slate-300 text-[10px] font-black uppercase">A</span>
                    <input 
                      type="date" 
                      value={journalDateEnd} 
                      onChange={(e) => setJournalDateEnd(e.target.value)}
                      className="bg-slate-50 text-[10px] font-bold p-2 rounded-lg border border-slate-100 outline-none"
                    />
                    {(journalDateStart || journalDateEnd || journalFilterType !== 'ALL') && (
                      <button 
                        onClick={() => { setJournalDateStart(''); setJournalDateEnd(''); setJournalFilterType('ALL'); }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                 </div>
              </div>

               <button
                  onClick={handleGenerateSamples}
                  disabled={isGeneratingSamples}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-lg disabled:opacity-50 no-print"
               >
                  {isGeneratingSamples ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  Simular Movimentos
               </button>
            </div>
            
            <JournalEntryForm 
              accounts={accounts} 
              onAddTransaction={handleAddTransaction} 
              onGetAIHelp={handleGetAIHelp} 
              currentPeriod={currentYear}
            />

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-500" /> Livro Diário - {selectedYear}
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{filteredJournalTransactions.length} Registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200 text-[11px] uppercase tracking-wider font-black">
                    <tr><th className="px-8 py-4">Data</th><th className="px-8 py-4">Fato</th><th className="px-8 py-4 text-right">Lançamentos</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJournalTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-8 py-5 text-slate-400 text-sm font-mono">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="px-8 py-5">
                          <span className={`block font-bold ${tx.type === TransactionType.CLOSING ? 'text-amber-600' : 'text-slate-800'}`}>{tx.description}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{tx.type}</span>
                        </td>
                        <td className="px-8 py-5">
                          {tx.parts.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-end gap-3 text-sm py-0.5">
                              <span className="text-slate-500 font-medium">{INITIAL_ACCOUNTS.find(a => a.id === p.accountId)?.name}</span>
                              <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[9px] font-black ${p.type === 'DEBIT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{p.type === 'DEBIT' ? 'D' : 'C'}</span>
                              <span className="font-black text-slate-900 w-24 text-right">R$ {p.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                    {filteredJournalTransactions.length === 0 && (
                      <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">Nenhum lançamento corresponde aos filtros em {selectedYear}.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'ledger' && (
          <div className="space-y-6 animate-in zoom-in-95">
             <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h2 className="text-2xl font-black">Livro Razão - Exercício {selectedYear}</h2>
                   <p className="text-indigo-200 text-xs font-medium">Os razonetes mostram o saldo inicial vindo do ano anterior e as movimentações de {selectedYear}.</p>
                </div>
                <div className="relative w-full md:w-80 no-print">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="Filtrar por código ou nome..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                  {ledgerSearch && (
                    <button onClick={() => setLedgerSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredLedgerAccounts.map(acc => (
                  <TAccount 
                    key={acc.id} 
                    account={acc} 
                    transactions={transactions} 
                    selectedYear={selectedYear} 
                  />
                ))}
                {filteredLedgerAccounts.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-400">
                    Nenhuma conta encontrada para "{ledgerSearch}".
                  </div>
                )}
             </div>
          </div>
        )}

        {currentView === 'statements' && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700">
             {/* PDF Export Only Header */}
             <div className="print-header">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">Relatório Contábil Consolidado</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">SimuContas Pro - Gestão Escolar de Excelência</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">Exercício Social: {selectedYear}</p>
                    <p className="text-[10px] text-slate-400">Data de Emissão: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
             </div>

             <div className="flex justify-end mb-4 no-print">
               <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
               >
                 <Download size={16} /> Exportar Relatórios
               </button>
             </div>

             <section className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden border border-white/10">
              <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-1">DRE do Período - {selectedYear}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Resultado do Exercício Social</p>
                </div>
                <TrendingUp className="text-emerald-400" size={32} />
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-emerald-400 font-black text-xl bg-white/5 p-5 rounded-2xl border border-white/5">
                  <span className="uppercase text-[10px] tracking-widest opacity-80">(+) Receita Bruta</span>
                  <span className="font-mono">R$ {currentReport.revenue.toLocaleString()}</span>
                </div>
                <div className="space-y-3 pl-6 border-l-2 border-white/10 py-2">
                  {INITIAL_ACCOUNTS.filter(a => a.type === AccountType.EXPENSE).map(a => {
                    const amount = transactions
                      .filter(t => t.period === selectedYear && t.type === TransactionType.OPERATIONAL)
                      .flatMap(t => t.parts)
                      .filter(p => p.accountId === a.id)
                      .reduce((s, p) => s + (p.type === 'DEBIT' ? p.amount : -p.amount), 0);
                    if (amount === 0) return null;
                    return (
                      <div key={a.id} className="flex justify-between text-sm italic text-slate-400">
                        <span>(-) {a.name}</span>
                        <span className="font-mono text-rose-300">R$ {amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-end text-rose-400 font-bold border-t border-white/10 pt-6 px-4">
                  <span className="uppercase text-[10px] tracking-widest opacity-70 block mb-1">Resultado Líquido</span>
                  <span className="text-3xl font-black font-mono">R$ {Math.abs(currentReport.netIncome).toLocaleString()}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 p-12">
              <div className="flex justify-between items-center mb-12 border-b border-slate-100 pb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Balanço Patrimonial</h3>
                  <p className="text-slate-500 text-sm font-medium italic">Posição Acumulada em 31/12/{selectedYear}</p>
                </div>
                <Landmark size={32} className="text-slate-300" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="flex flex-col">
                  <h4 className="font-black text-indigo-700 border-b-4 border-indigo-600 pb-2 mb-6 uppercase text-sm tracking-widest">ATIVO</h4>
                  <div className="flex-1 space-y-2 mb-8">
                    {currentReport.accounts.filter(a => a.type === AccountType.ASSET && a.balance !== 0).map(a => (
                      <div key={a.id} className="flex justify-between py-3 px-4 hover:bg-slate-50 rounded-2xl transition-all">
                        <span className="font-bold text-slate-700">{a.name}</span>
                        <span className="font-mono font-black text-slate-900">R$ {a.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-indigo-400">TOTAL ATIVO</span>
                    <span className="text-2xl font-black font-mono">R$ {currentReport.accounts.filter(a => a.type === AccountType.ASSET).reduce((s, a) => s + a.balance, 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <h4 className="font-black text-amber-600 border-b-4 border-amber-500 pb-2 mb-6 uppercase text-sm tracking-widest">PASSIVO + PL</h4>
                  <div className="flex-1 space-y-4 mb-8">
                    {currentReport.accounts.filter(a => (a.type === AccountType.LIABILITY || a.type === AccountType.EQUITY) && a.code !== '3.1.99' && a.balance !== 0).map(a => (
                      <div key={a.id} className={`flex justify-between py-3 px-4 rounded-2xl ${a.code === '3.1.02' ? 'bg-indigo-50 border border-indigo-100' : ''}`}>
                        <span className="font-bold text-slate-700">{a.name}</span>
                        <span className="font-mono font-black text-slate-900">R$ {a.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-amber-400">TOTAL P + PL</span>
                    <span className="text-2xl font-black font-mono">R$ {currentReport.accounts.filter(a => (a.type === AccountType.LIABILITY || a.type === AccountType.EQUITY) && a.code !== '3.1.99').reduce((s, a) => s + a.balance, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
