import { Transaction, Rule, ITransaction, IRule } from './models';

// Helper function to check if a transaction matches a rule
const matchesRule = (transaction: ITransaction, rule: IRule): boolean => {
  const { conditions } = rule;

  if (conditions.merchant && transaction.merchant !== conditions.merchant) {
    return false;
  }
  if (conditions.account && transaction.account !== conditions.account) {
    return false;
  }
  if (conditions.maxAmount && transaction.amount > conditions.maxAmount) {
    return false;
  }
  if (conditions.dayOfWeek !== undefined) {
    const transactionDay = new Date(transaction.date).getDay();
    if (transactionDay !== conditions.dayOfWeek) {
      return false;
    }
  }

  return true;
};

// Transaction Controllers
export const getTransactions = async () => {
  return await Transaction.find();
};

export const addTransaction = async (transactionData: ITransaction) => {
  const newTransaction = new Transaction(transactionData);
  await newTransaction.save();
  return newTransaction;
};

// Rule Controllers
export const getRules = async () => {
  return await Rule.find();
};

export const addRule = async (ruleData: IRule) => {
  const newRule = new Rule(ruleData);
  await newRule.save();
  return newRule;
};

// Reapply Rules Controller
export const reapplyRules = async () => {
  const transactions = await Transaction.find();
  const rules = await Rule.find();

  let updatedCount = 0;

  for (const transaction of transactions) {
    for (const rule of rules) {
      if (matchesRule(transaction, rule)) {
        if (transaction.category !== rule.newCategory) {
          transaction.category = rule.newCategory;
          await transaction.save();
          updatedCount++;
        }
        // Apply the first matching rule and break
        break;
      }
    }
  }
  return { message: `Re-categorized ${updatedCount} transactions.` };
};
