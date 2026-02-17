
import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { Account, TransactionPart, Transaction, TransactionType } from '../types';

interface JournalEntryFormProps {
  accounts: Account[];
  onAddTransaction: (tx: Transaction) => void;
  onGetAIHelp: (desc: string) => void;
  currentPeriod: number;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ accounts, onAddTransaction, onGetAIHelp, currentPeriod }) => {
  const [description, setDescription] = useState('');
  const [parts, setParts] = useState<TransactionPart[]>([
    { accountId: '', type: 'DEBIT', amount: 0 },
    { accountId: '', type: 'CREDIT', amount: 0 },
  ]);

  const totalDebits = parts.filter(p => p.type === 'DEBIT').reduce((s, p) => s + p.amount, 0);
  const totalCredits = parts.filter(p => p.type === 'CREDIT').reduce((s, p) => s + p.amount, 0);
  const isBalanced = totalDebits === totalCredits && totalDebits > 0;

  const addPart = () => setParts([...parts, { accountId: '', type: 'DEBIT', amount: 0 }]);
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));

  const updatePart = (index: number, field: keyof TransactionPart, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    // Fix: Added missing 'type' and 'period' properties to satisfy the Transaction interface
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description,
      parts: parts.filter(p => p.accountId !== ''),
      type: TransactionType.OPERATIONAL,
      period: currentPeriod,
    };

    onAddTransaction(newTx);
    setDescription('');
    setParts([{ accountId: '', type: 'DEBIT', amount: 0 }, { accountId: '', type: 'CREDIT', amount: 0 }]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black flex items-center gap-3 text-slate-800">
          <BookOpen className="text-indigo-500" /> Novo Lançamento Contábil
        </h2>
        <button
          onClick={() => onGetAIHelp(description)}
          type="button"
          className="text-xs flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-black transition-all disabled:opacity-30"
          disabled={!description}
        >
          <Sparkles size={14} /> AJUDA DO MENTOR IA
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Descrição do Fato Administrativo</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Pagamento de salários via banco..."
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
            required
          />
        </div>

        <div className="space-y-4">
          {parts.map((part, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Conta Contábil</label>
                <select
                  value={part.accountId}
                  onChange={(e) => updatePart(index, 'accountId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700"
                  required
                >
                  <option value="">Selecione uma conta...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.code} | {acc.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-32">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Natureza</label>
                <select
                  value={part.type}
                  onChange={(e) => updatePart(index, 'type', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                    part.type === 'DEBIT' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                  }`}
                >
                  <option value="DEBIT">DÉBITO</option>
                  <option value="CREDIT">CRÉDITO</option>
                </select>
              </div>
              <div className="w-full md:w-40">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor (R$)</label>
                <input
                  type="number"
                  value={part.amount || ''}
                  onChange={(e) => updatePart(index, 'amount', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0,00"
                  required
                />
              </div>
              {parts.length > 2 && (
                <button 
                  type="button" 
                  onClick={() => removePart(index)} 
                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors mb-[2px]"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          type="button" 
          onClick={addPart} 
          className="text-xs flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-700 transition-colors"
        >
          <Plus size={16} /> ADICIONAR PARTIDA DOBRADA
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest">
            <div className="flex flex-col">
              <span className="text-slate-400 mb-1">Total Débitos</span>
              <span className="text-blue-600 text-lg">R$ {totalDebits.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 mb-1">Total Créditos</span>
              <span className="text-amber-600 text-lg">R$ {totalCredits.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {!isBalanced && totalDebits > 0 && (
              <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase bg-rose-50 px-4 py-2 rounded-xl">
                <AlertCircle size={14} /> BALANÇO DESEQUILIBRADO
              </div>
            )}
            <button
              type="submit"
              disabled={!isBalanced}
              className={`px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all ${
                isBalanced ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Confirmar Lançamento
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;
