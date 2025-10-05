import { ITransaction, IRule } from './models';
import { evaluateRule } from './ruleEvaluator';
import { inMemoryTransactions, inMemoryRules } from './db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

// Helper to generate unique IDs for in-memory items
const generateUniqueId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Transaction Controllers
export const getTransactions = async (): Promise<ITransaction[]> => {
  return inMemoryTransactions;
};

export const addTransaction = async (transactionData: Omit<ITransaction, 'id'>): Promise<ITransaction> => {
  const newTransaction: ITransaction = {
    id: generateUniqueId(),
    ...transactionData,
    date: new Date(transactionData.date), // Convert date string to Date object
  };
  inMemoryTransactions.push(newTransaction);
  return newTransaction;
};

// Rule Controllers
export const getRules = async (): Promise<IRule[]> => {
  return inMemoryRules;
};

export const addRule = async (ruleData: Omit<IRule, 'id'>): Promise<IRule> => {
  const newRule: IRule = {
    id: generateUniqueId(),
    ruleDefinition: ruleData.ruleDefinition,
  };
  inMemoryRules.push(newRule);
  return newRule;
};

// Reapply Rules Controller
export const reapplyRules = async () => {
  let updatedCount = 0;

  for (const transaction of inMemoryTransactions) {
    for (const rule of inMemoryRules) {
      // Extract newCategory from rule.ruleDefinition
      const parts = rule.ruleDefinition.split('->');
      if (parts.length !== 2) {
        console.error('Invalid ruleDefinition format in stored rule:', rule.ruleDefinition);
        continue; // Skip this rule if format is invalid
      }
      const newCategoryFromRule = parts[1].trim().replace(/^"|"$/g, ''); // Remove quotes

      if (evaluateRule(transaction, rule)) {
        if (transaction.category !== newCategoryFromRule) {
          transaction.category = newCategoryFromRule;
          updatedCount++;
        }
        // Apply the first matching rule and break
        break;
      }
    }
  }
  return { message: `Re-categorized ${updatedCount} transactions.` };
};

// Gemini DSL Generation Controller
export const generateDsl = async (naturalLanguageText: string): Promise<{ dsl: string }> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const prompt = `Convert the following natural language into a DSL rule. The DSL rule should follow the format: "condition -> newCategory".

Available transaction fields are: merchant (string), amount (number), date (Date), account (string), category (string).
Available helper functions for date are: dayOfWeek(date) (0 for Sunday, 6 for Saturday), month(date) (1 for Jan, 12 for Dec), year(date), day(date), isWeekend(date), getWeekNumber(date).

Examples:
- "If merchant is Starbucks and amount is less than 10, categorize as Coffee" -> 'transaction.merchant === "Starbucks" && transaction.amount < 10 -> "Coffee"'
- "Categorize transactions from Walmart on weekends as Groceries" -> 'transaction.merchant === "Walmart" && isWeekend(transaction.date) -> "Groceries"'
- "If amount is greater than 100 and account is Credit Card, categorize as Large Purchase" -> 'transaction.amount > 100 && transaction.account === "Credit Card" -> "Large Purchase"'
- "If merchant contains 'Amazon' and month is December, categorize as Holiday Shopping" -> 'transaction.merchant.includes("Amazon") && month(transaction.date) === 12 -> "Holiday Shopping"'

Natural Language: "${naturalLanguageText}"

DSL Rule:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Gemini might return extra formatting like ```dsl
    const dsl = text.replace(/^```(?:dsl)?\n|\n```$/g, '').trim();
    console.log('Gemini generated DSL:', dsl);
    return { dsl };
  } catch (error) {
    console.error('Error generating DSL with Gemini:', error);
    throw new Error('Failed to generate DSL.');
  }
};