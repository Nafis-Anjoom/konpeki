import { describe, it, expect } from 'vitest';
import { evaluateRule, dslHelpers } from './ruleEvaluator'; // Import dslHelpers for context
import { ITransaction, IRule } from './models';

describe('evaluateRule (DSL)', () => {
  const mockTransaction: ITransaction = {
    id: '1',
    merchant: 'Walmart',
    amount: 75.50,
    date: new Date('2025-10-04T10:00:00Z'), // Saturday
    account: 'Checking',
    category: 'Groceries',
  };

  it('should return true for a simple matching rule (equality)', () => {
    const rule: IRule = {
      id: 'rule1',
      ruleDefinition: `transaction.merchant === "Walmart" -> "Shopping"`,
      newCategory: 'Shopping',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should return false for a simple non-matching rule (equality)', () => {
    const rule: IRule = {
      id: 'rule2',
      ruleDefinition: `transaction.merchant === "Target" -> "Shopping"`,
      newCategory: 'Shopping',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });

  it('should handle AND operator correctly', () => {
    const rule: IRule = {
      id: 'rule3',
      ruleDefinition: `transaction.merchant === "Walmart" && transaction.amount > 50 -> "Big Shopping"`,
      newCategory: 'Big Shopping',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle OR operator correctly', () => {
    const rule: IRule = {
      id: 'rule4',
      ruleDefinition: `transaction.merchant === "Target" || transaction.amount < 100 -> "Flexible"`,
      newCategory: 'Flexible',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle dayOfWeek function correctly', () => {
    const rule: IRule = {
      id: 'rule5',
      ruleDefinition: `dayOfWeek(transaction.date) === 6 -> "Weekend"`, // Saturday
      newCategory: 'Weekend',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle month function correctly', () => {
    const rule: IRule = {
      id: 'rule6',
      ruleDefinition: `month(transaction.date) === 10 -> "October Spending"`, // October
      newCategory: 'October Spending',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle string includes (like contains)', () => {
    const rule: IRule = {
      id: 'rule7',
      ruleDefinition: `transaction.merchant.includes("Wal") -> "Partial Match"`,
      newCategory: 'Partial Match',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle regex test (like matches)', () => {
    const rule: IRule = {
      id: 'rule8',
      ruleDefinition: `new RegExp(".*wal.*t", "i").test(transaction.merchant) -> "Regex Match"`,
      newCategory: 'Regex Match',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle complex nested conditions', () => {
    const rule: IRule = {
      id: 'rule9',
      ruleDefinition: `(transaction.merchant === "Walmart" || transaction.merchant === "Target") && transaction.amount <= 80 && dayOfWeek(transaction.date) === 6 -> "Complex Rule Category"`,
      newCategory: 'Complex Rule Category',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should return false for complex non-matching conditions', () => {
    const rule: IRule = {
      id: 'rule10',
      ruleDefinition: `transaction.merchant === "Walmart" && transaction.amount > 100 -> "Should Not Match"`,
      newCategory: 'Should Not Match',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });

  it('should handle invalid ruleDefinition format', () => {
    const rule: IRule = {
      id: 'rule11',
      ruleDefinition: `transaction.merchant === "Walmart" "No Arrow"`, // Missing '->'
      newCategory: 'Invalid',
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });

  it('should handle compilation errors in ruleDefinition', () => {
    const rule: IRule = {
      id: 'rule12',
      ruleDefinition: `transaction.merchant === "Walmart" && invalid.syntax -> "Error Category"`,
      newCategory: 'Error Category',
    };
    // Expect it to return false due to compilation error
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });

  it('should handle evaluation errors in ruleDefinition', () => {
    const rule: IRule = {
      id: 'rule13',
      ruleDefinition: `transaction.merchant.nonExistentMethod() -> "Error Category"`,
      newCategory: 'Error Category',
    };
    // Expect it to return false due to evaluation error
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });
});