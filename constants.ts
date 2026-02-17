
import { Account, AccountType, AccountNature, ESGCategory } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  // Ativos
  { id: '1', code: '1.1.01', name: 'Caixa e Equivalentes', type: AccountType.ASSET, nature: AccountNature.DEBIT, balance: 100000, esgCategory: ESGCategory.NONE },
  { id: '2', code: '1.1.02', name: 'Contas a Receber', type: AccountType.ASSET, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.NONE },
  { id: '3', code: '1.1.03', name: 'Estoques', type: AccountType.ASSET, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.NONE },
  { id: '4', code: '1.2.01', name: 'Imobilizado (Máquinas)', type: AccountType.ASSET, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.ENVIRONMENTAL },
  
  // Passivos
  { id: '5', code: '2.1.01', name: 'Fornecedores', type: AccountType.LIABILITY, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.GOVERNANCE },
  { id: '6', code: '2.1.02', name: 'Salários a Pagar', type: AccountType.LIABILITY, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.SOCIAL },
  { id: '7', code: '2.2.01', name: 'Empréstimos Longo Prazo', type: AccountType.LIABILITY, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.GOVERNANCE },

  // PL
  { id: '8', code: '3.1.01', name: 'Capital Social', type: AccountType.EQUITY, nature: AccountNature.CREDIT, balance: 100000, esgCategory: ESGCategory.NONE },
  { id: '9', code: '3.1.02', name: 'Lucros/Prejuízos Acumulados', type: AccountType.EQUITY, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.NONE },
  // Conta Transitória de ARE
  { id: 'ARE_TEMP', code: '3.1.99', name: 'Apuração do Resultado (ARE)', type: AccountType.EQUITY, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.NONE },

  // Receitas
  { id: '10', code: '4.1.01', name: 'Receita de Vendas', type: AccountType.REVENUE, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.NONE },
  { id: '11', code: '4.1.02', name: 'Receita de Serviços', type: AccountType.REVENUE, nature: AccountNature.CREDIT, balance: 0, esgCategory: ESGCategory.NONE },

  // Despesas
  { id: '12', code: '5.1.01', name: 'Custo das Mercadorias Vendidas', type: AccountType.EXPENSE, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.NONE },
  { id: '13', code: '5.1.02', name: 'Despesas Administrativas', type: AccountType.EXPENSE, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.NONE },
  { id: '14', code: '5.1.03', name: 'Despesas com Energia Limpa', type: AccountType.EXPENSE, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.ENVIRONMENTAL },
  { id: '15', code: '5.1.04', name: 'Despesas com Treinamento', type: AccountType.EXPENSE, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.SOCIAL },
  { id: '16', code: '5.1.05', name: 'Depreciação', type: AccountType.EXPENSE, nature: AccountNature.DEBIT, balance: 0, esgCategory: ESGCategory.NONE },
];
