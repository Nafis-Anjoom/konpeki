import { ITransaction, IRule } from './models';
import { evaluateRule } from './ruleEvaluator';
import { inMemoryTransactions, inMemoryRules } from './db';

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
