
import { Account, Transaction, AccountType, AccountNature, FinancialRatios, ESGMetrics, ESGCategory, FinancialReport, AREStep, TransactionPart, TransactionType } from '../types';
import { INITIAL_ACCOUNTS } from '../constants';

export class AccountingEngine {
  static getAccountBalanceAt(accountId: string, transactions: Transaction[], upToPeriod: number): number {
    const accBase = INITIAL_ACCOUNTS.find(a => a.id === accountId);
    if (!accBase) return 0;

    let balance = accBase.balance; 
    
    const relevantTransactions = transactions.filter(t => t.period <= upToPeriod);

    relevantTransactions.forEach(tx => {
      tx.parts.forEach(part => {
        if (part.accountId === accountId) {
          if (part.type === 'DEBIT') {
            balance += (accBase.nature === AccountNature.DEBIT ? part.amount : -part.amount);
          } else {
            balance += (accBase.nature === AccountNature.CREDIT ? part.amount : -part.amount);
          }
        }
      });
    });

    return balance;
  }

  static updateBalances(accounts: Account[], transactions: Transaction[]): Account[] {
    const lastPeriod = transactions.length > 0 ? Math.max(...transactions.map(t => t.period)) : 2024;
    return accounts.map(acc => ({
      ...acc,
      balance: this.getAccountBalanceAt(acc.id, transactions, lastPeriod)
    }));
  }

  static generateReport(accounts: Account[], transactions: Transaction[], period: number): FinancialReport {
    const periodOps = transactions.filter(t => t.period === period && t.type === TransactionType.OPERATIONAL);
    
    let revenue = 0;
    let expenses = 0;
    let cmv = 0;

    periodOps.forEach(tx => {
      tx.parts.forEach(p => {
        const accBase = INITIAL_ACCOUNTS.find(ia => ia.id === p.accountId);
        if (!accBase) return;

        if (accBase.type === AccountType.REVENUE) {
          revenue += (p.type === 'CREDIT' ? p.amount : -p.amount);
        } else if (accBase.type === AccountType.EXPENSE) {
          expenses += (p.type === 'DEBIT' ? p.amount : -p.amount);
          if (accBase.code === '5.1.01') cmv += p.amount;
        }
      });
    });

    const periodAccounts = accounts.map(acc => ({
      ...acc,
      balance: this.getAccountBalanceAt(acc.id, transactions, period)
    }));

    const netIncome = revenue - expenses;
    
    return {
      timestamp: new Date().toISOString(),
      period,
      accounts: periodAccounts,
      ratios: this.calculateRatios(periodAccounts, revenue, expenses),
      esg: this.calculateESG(periodAccounts),
      revenue,
      expenses,
      cmv,
      netIncome
    };
  }

  static calculateRatios(accounts: Account[], revenue: number, expenses: number): FinancialRatios {
    const currentAssets = accounts.filter(a => a.type === AccountType.ASSET && a.code.startsWith('1.1')).reduce((s, a) => s + a.balance, 0);
    const currentLiabilities = accounts.filter(a => a.type === AccountType.LIABILITY && a.code.startsWith('2.1')).reduce((s, a) => s + a.balance, 0);
    const netIncome = revenue - expenses;
    const equity = accounts.filter(a => a.type === AccountType.EQUITY).reduce((s, a) => s + a.balance, 0);
    const totalAssets = accounts.filter(a => a.type === AccountType.ASSET).reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === AccountType.LIABILITY).reduce((s, a) => s + a.balance, 0);
    const dep = accounts.find(a => a.code === '5.1.05')?.balance || 0;

    return {
      currentLiquidity: currentLiabilities !== 0 ? currentAssets / currentLiabilities : currentAssets,
      roe: equity !== 0 ? (netIncome / equity) * 100 : 0,
      debtRatio: totalAssets !== 0 ? (totalLiabilities / totalAssets) * 100 : 0,
      ebitda: netIncome + dep,
      grossMargin: revenue !== 0 ? ((revenue - (accounts.find(a => a.code === '5.1.01')?.balance || 0)) / revenue) * 100 : 0,
      netMargin: revenue !== 0 ? (netIncome / revenue) * 100 : 0
    };
  }

  static calculateESG(accounts: Account[]): ESGMetrics {
    // Cálculo mais dinâmico baseado na existência e volume das contas
    const calculatePillarScore = (category: ESGCategory) => {
      const relevantAccounts = accounts.filter(acc => acc.esgCategory === category);
      if (relevantAccounts.length === 0) return 0;
      
      const activeAccounts = relevantAccounts.filter(acc => Math.abs(acc.balance) > 0);
      // Base: 40% pela existência de contas ativas, 60% pelo peso relativo (simulado)
      const existenceScore = (activeAccounts.length / relevantAccounts.length) * 40;
      const activityScore = activeAccounts.length > 0 ? 60 : 0;
      
      return Math.round(existenceScore + activityScore);
    };

    const environmental = calculatePillarScore(ESGCategory.ENVIRONMENTAL);
    const social = calculatePillarScore(ESGCategory.SOCIAL);
    const governance = calculatePillarScore(ESGCategory.GOVERNANCE);

    return { 
      environmental, 
      social, 
      governance, 
      overallScore: Math.round((environmental + social + governance) / 3)
    };
  }

  static performARE(accounts: Account[], period: number): { steps: AREStep[], closingTransaction: Transaction | null } {
    const steps: AREStep[] = [];
    const transactionParts: TransactionPart[] = [];
    
    const revenueAccounts = accounts.filter(a => a.type === AccountType.REVENUE && a.balance !== 0);
    const expenseAccounts = accounts.filter(a => a.type === AccountType.EXPENSE && a.balance !== 0);

    if (revenueAccounts.length === 0 && expenseAccounts.length === 0) {
      return { steps: [], closingTransaction: null };
    }

    const revenueEntries = revenueAccounts.flatMap(a => {
      transactionParts.push({ accountId: a.id, type: 'DEBIT', amount: Math.abs(a.balance) });
      transactionParts.push({ accountId: 'ARE_TEMP', type: 'CREDIT', amount: Math.abs(a.balance) });
      return [
        { accountName: a.name, type: 'DEBIT' as const, amount: Math.abs(a.balance), reason: 'Encerramento de Receita' },
        { accountName: 'ARE', type: 'CREDIT' as const, amount: Math.abs(a.balance), reason: 'Transferência p/ ARE' }
      ];
    });

    if (revenueEntries.length > 0) steps.push({ title: "1. Transferência de Receitas", description: "Zera contas credoras.", entries: revenueEntries });

    const expenseEntries = expenseAccounts.flatMap(a => {
      transactionParts.push({ accountId: a.id, type: 'CREDIT', amount: Math.abs(a.balance) });
      transactionParts.push({ accountId: 'ARE_TEMP', type: 'DEBIT', amount: Math.abs(a.balance) });
      return [
        { accountName: a.name, type: 'CREDIT' as const, amount: Math.abs(a.balance), reason: 'Encerramento de Despesa' },
        { accountName: 'ARE', type: 'DEBIT' as const, amount: Math.abs(a.balance), reason: 'Transferência p/ ARE' }
      ];
    });

    if (expenseEntries.length > 0) steps.push({ title: "2. Transferência de Despesas", description: "Zera contas devedoras.", entries: expenseEntries });

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const totalExpense = expenseAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const netIncome = totalRevenue - totalExpense;

    if (netIncome !== 0) {
      const isProfit = netIncome > 0;
      const amount = Math.abs(netIncome);
      transactionParts.push({ accountId: 'ARE_TEMP', type: isProfit ? 'DEBIT' : 'CREDIT', amount });
      transactionParts.push({ accountId: '9', type: isProfit ? 'CREDIT' : 'DEBIT', amount });

      steps.push({
        title: "3. Destinação do Resultado",
        description: `Resultado de R$ ${amount.toLocaleString()} p/ PL.`,
        entries: [
          { accountName: 'ARE', type: isProfit ? 'DEBIT' : 'CREDIT', amount, reason: 'Zerar ARE' },
          { accountName: 'Lucros/Prejuízos Acumulados', type: isProfit ? 'CREDIT' : 'DEBIT', amount, reason: `Reconhecimento de ${isProfit ? 'Lucro' : 'Prejuízo'}` }
        ]
      });
    }

    const closingTransaction: Transaction = {
      id: `ARE-${period}-${Date.now()}`,
      date: new Date().toISOString(),
      description: `Encerramento do Exercício ${period}`,
      parts: transactionParts,
      type: TransactionType.CLOSING,
      period
    };

    return { steps, closingTransaction };
  }
}
