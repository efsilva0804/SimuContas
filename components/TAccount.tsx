
import React from 'react';
import { Account, Transaction, AccountType, AccountNature, ESGCategory } from '../types';
import { AccountingEngine } from '../services/accountingEngine';
import { Leaf, Heart, ShieldCheck } from 'lucide-react';

interface TAccountProps {
  account: Account;
  transactions: Transaction[];
  selectedYear: number;
}

const TAccount: React.FC<TAccountProps> = ({ account, transactions, selectedYear }) => {
  // Saldo inicial: acumulado até o ano ANTERIOR
  const initialBalance = AccountingEngine.getAccountBalanceAt(account.id, transactions, selectedYear - 1);
  
  // Movimentações APENAS do ano selecionado
  const currentYearTransactions = transactions.filter(t => t.period === selectedYear);
  
  const debits = currentYearTransactions.flatMap(tx => 
    tx.parts.filter(p => p.accountId === account.id && p.type === 'DEBIT')
  );
  const credits = currentYearTransactions.flatMap(tx => 
    tx.parts.filter(p => p.accountId === account.id && p.type === 'CREDIT')
  );

  const totalD = debits.reduce((s, p) => s + p.amount, 0);
  const totalC = credits.reduce((s, p) => s + p.amount, 0);
  
  const currentBalance = initialBalance + (account.nature === AccountNature.DEBIT ? (totalD - totalC) : (totalC - totalD));

  // Determinar se é Ativo/Passivo ou Receita/Despesa para a lógica de exibição de saldo inicial
  const isBalanceSheet = account.type === AccountType.ASSET || account.type === AccountType.LIABILITY || account.type === AccountType.EQUITY;

  const getESGBadge = () => {
    switch (account.esgCategory) {
      case ESGCategory.ENVIRONMENTAL:
        return (
          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
            <Leaf size={10} /> Ambiental
          </div>
        );
      case ESGCategory.SOCIAL:
        return (
          <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
            <Heart size={10} /> Social
          </div>
        );
      case ESGCategory.GOVERNANCE:
        return (
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
            <ShieldCheck size={10} /> Governança
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-w-[260px]">
      <div className="bg-slate-800 text-white p-3 flex flex-col items-center relative">
        <div className="absolute top-2 right-2">
          {getESGBadge()}
        </div>
        <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">{account.code}</span>
        <span className="text-xs font-black uppercase text-center truncate w-full px-4">{account.name}</span>
      </div>
      
      {/* Saldo Inicial (Apenas para Contas Patrimoniais) */}
      {isBalanceSheet && initialBalance !== 0 && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase">Saldo Anterior:</span>
          <span className="text-xs font-black text-slate-900">R$ {Math.abs(initialBalance).toLocaleString()}</span>
        </div>
      )}

      <div className="flex flex-1 min-h-[160px]">
        {/* Lado do Débito */}
        <div className="flex-1 border-r border-slate-300 p-3">
          <div className="text-center font-black text-blue-500 text-[10px] mb-3 border-b border-blue-50 pb-1">DÉBITO</div>
          <div className="space-y-1">
            {debits.map((d, i) => (
              <div key={i} className="flex justify-between items-center group">
                 <span className="text-[9px] text-slate-300 font-mono">#</span>
                 <span className="text-xs font-mono font-bold text-blue-700">R$ {d.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Lado do Crédito */}
        <div className="flex-1 p-3">
          <div className="text-center font-black text-amber-500 text-[10px] mb-3 border-b border-amber-50 pb-1">CRÉDITO</div>
          <div className="space-y-1">
            {credits.map((c, i) => (
              <div key={i} className="flex justify-between items-center">
                 <span className="text-[9px] text-slate-300 font-mono">#</span>
                 <span className="text-xs font-mono font-bold text-amber-700">R$ {c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-black">
          <span className="text-blue-600">Σ D: R$ {totalD.toLocaleString()}</span>
          <span className="text-amber-600">Σ C: R$ {totalC.toLocaleString()}</span>
        </div>
        <div className={`mt-2 p-2 rounded-xl text-center font-black text-sm border ${
          currentBalance >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {currentYearTransactions.length === 0 && !isBalanceSheet ? 'Zerada' : `Saldo: R$ ${Math.abs(currentBalance).toLocaleString()}`}
        </div>
      </div>
    </div>
  );
};

export default TAccount;
