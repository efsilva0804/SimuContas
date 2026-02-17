
import { GoogleGenAI, Type } from "@google/genai";
import { Account, FinancialReport, Transaction } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeFinancials(report: FinancialReport) {
    const prompt = `
      Atue como Principal Analyst & Accounting Professor (CFO Mentor).
      Analise os dados financeiros abaixo e gere um Relatório de Elite (Notas Explicativas).

      RELATÓRIO DE DADOS:
      - Balanço (Vertical): ${JSON.stringify(report.accounts.filter(a => a.balance !== 0).map(a => ({ 
          name: a.name, 
          balance: a.balance, 
          AV: a.verticalAnalysis?.toFixed(2) + '%' 
        })))}
      - Indicadores: 
        * Liquidez Corrente: ${report.ratios.currentLiquidity.toFixed(2)}
        * ROE: ${report.ratios.roe.toFixed(2)}%
        * EBITDA: R$ ${report.ratios.ebitda.toLocaleString()}
        * Margem Líquida: ${report.ratios.netMargin.toFixed(2)}%
      - ESG Score: E:${report.esg.environmental}, S:${report.esg.social}, G:${report.esg.governance}

      REQUISITOS DO RELATÓRIO (Markdown):
      1. # Análise de Desempenho: Diagnóstico rápido sobre rentabilidade e liquidez.
      2. # Notas Explicativas: Explique 2 variações significativas detectadas na Análise Vertical.
      3. # Diagnóstico ESG: Como as práticas de sustentabilidade estão impactando os números.
      4. # Master Tip: Uma recomendação estratégica de CFO para melhorar o ROE ou reduzir endividamento.
      
      Seja técnico, porém didático.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao conectar com o motor de inteligência contábil.";
    }
  }

  async getEntryFeedback(description: string, accounts: Account[]) {
    const prompt = `
      Contexto: Estudante de contabilidade tentando registrar: "${description}".
      Plano de Contas: ${JSON.stringify(accounts.map(a => ({ code: a.code, name: a.name, type: a.type })))}
      
      Tarefa: 
      1. Identifique as contas prováveis de Débito e Crédito.
      2. Explique brevemente o PORQUÊ didático (ex: Ativo aumenta por débito porque...).
      3. Alerte sobre possíveis erros de natureza.
      
      Formato: Curto, direto e encorajador.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return "Dica: Revise a natureza das contas envolvidas (Ativo/Passivo).";
    }
  }

  async generateSampleTransactions(accounts: Account[]): Promise<any[]> {
    const prompt = `
      Gere 10 lançamentos contábeis (fatos administrativos) didáticos para uma empresa comercial.
      Use estritamente as contas fornecidas: ${JSON.stringify(accounts.map(a => ({ id: a.id, code: a.code, name: a.name })))}
      
      Regras:
      1. Cada lançamento deve ter Débito e Crédito equilibrados (Double Entry).
      2. Inclua fatos variados: Vendas, Compras de Estoque, Pagamento de Despesas, Aquisição de Imobilizado.
      3. Use datas diferentes dentro do mês atual.
      4. Retorne APENAS um array JSON puro.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                date: { type: Type.STRING },
                parts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      accountId: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['DEBIT', 'CREDIT'] },
                      amount: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      const text = response.text;
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating samples:", error);
      return [];
    }
  }
}
