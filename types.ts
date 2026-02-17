
export enum AccountType {
  ASSET = 'Ativo',
  LIABILITY = 'Passivo',
  EQUITY = 'Patrimônio Líquido',
  REVENUE = 'Receita',
  EXPENSE = 'Despesa'
}

export enum AccountNature {
  DEBIT = 'Devedora',
  CREDIT = 'Credora'
}

export enum TransactionType {
  OPERATIONAL = 'OPERATIONAL',
  CLOSING = 'CLOSING'
}

export enum ESGCategory {
  ENVIRONMENTAL = 'Ambiental',
  SOCIAL = 'Social',
  GOVERNANCE = 'Governança',
  NONE = 'Nenhuma'
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  nature: AccountNature;
  balance: number;
  esgCategory: ESGCategory;
  verticalAnalysis?: number;
}

export interface TransactionPart {
  accountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  parts: TransactionPart[];
  type: TransactionType;
  period: number;
  esgTags?: ESGCategory[];
}

export interface FinancialRatios {
  currentLiquidity: number;
  roe: number;
  debtRatio: number;
  ebitda: number;
  grossMargin: number;
  netMargin: number;
}

export interface ESGMetrics {
  environmental: number;
  social: number;
  governance: number;
  overallScore: number;
}

export interface FinancialReport {
  timestamp: string;
  period: number;
  accounts: Account[];
  ratios: FinancialRatios;
  esg: ESGMetrics;
  revenue: number;
  expenses: number;
  cmv: number;
  netIncome: number;
}

export interface AREStep {
  title: string;
  description: string;
  entries: {
    accountName: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
    reason: string;
  }[];
}

export type ExportFormat = 'PDF' | 'CSV' | 'JSON';
