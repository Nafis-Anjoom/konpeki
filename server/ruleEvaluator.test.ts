import { describe, it, expect } from 'vitest';
import { evaluateRule } from './ruleEvaluator';
import { ITransaction, IRule } from './models';

describe('evaluateRule', () => {
  const mockTransaction: ITransaction = {
    _id: '1',
    merchant: 'Walmart',
    amount: 75.50,
    date: new Date('2025-10-04T10:00:00Z'), // Saturday
    account: 'Checking',
    category: 'Groceries',
    __v: 0,
  };

  it('should return true for a simple matching rule', () => {
    const rule: IRule = {
      _id: 'rule1',
      ruleDefinition: {
        operator: '==',
        field: 'transaction.merchant',
        value: 'Walmart',
      },
      newCategory: 'Shopping',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should return false for a simple non-matching rule', () => {
    const rule: IRule = {
      _id: 'rule2',
      ruleDefinition: {
        operator: '==',
        field: 'transaction.merchant',
        value: 'Target',
      },
      newCategory: 'Shopping',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });

  it('should handle AND operator correctly', () => {
    const rule: IRule = {
      _id: 'rule3',
      ruleDefinition: {
        operator: 'AND',
        conditions: [
          {
            operator: '==',
            field: 'transaction.merchant',
            value: 'Walmart',
          },
          {
            operator: '>',
            field: 'transaction.amount',
            value: 50,
          },
        ],
      },
      newCategory: 'Big Shopping',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle OR operator correctly', () => {
    const rule: IRule = {
      _id: 'rule4',
      ruleDefinition: {
        operator: 'OR',
        conditions: [
          {
            operator: '==',
            field: 'transaction.merchant',
            value: 'Target',
          },
          {
            operator: '<',
            field: 'transaction.amount',
            value: 100,
          },
        ],
      },
      newCategory: 'Flexible',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle dayOfWeek function', () => {
    const rule: IRule = {
      _id: 'rule5',
      ruleDefinition: {
        operator: '==',
        field: 'dayOfWeek(transaction.date)',
        value: 6, // Saturday
      },
      newCategory: 'Weekend',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle month function', () => {
    const rule: IRule = {
      _id: 'rule6',
      ruleDefinition: {
        operator: '==',
        field: 'month(transaction.date)',
        value: 10, // October
      },
      newCategory: 'October Spending',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle contains operator', () => {
    const rule: IRule = {
      _id: 'rule7',
      ruleDefinition: {
        operator: 'contains',
        field: 'transaction.merchant',
        value: 'Wal',
      },
      newCategory: 'Partial Match',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle matches (regex) operator', () => {
    const rule: IRule = {
      _id: 'rule8',
      ruleDefinition: {
        operator: 'matches',
        field: 'transaction.merchant',
        value: '.*wal.*t',
      },
      newCategory: 'Regex Match',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should handle complex nested conditions', () => {
    const rule: IRule = {
      _id: 'rule9',
      ruleDefinition: {
        operator: 'AND',
        conditions: [
          {
            operator: 'OR',
            conditions: [
              {
                operator: '==',
                field: 'transaction.merchant',
                value: 'Walmart',
              },
              {
                operator: '==',
                field: 'transaction.merchant',
                value: 'Target',
              },
            ],
          },
          {
            operator: '<=',
            field: 'transaction.amount',
            value: 80,
          },
          {
            operator: '==',
            field: 'dayOfWeek(transaction.date)',
            value: 6,
          },
        ],
      },
      newCategory: 'Complex Rule Category',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(true);
  });

  it('should return false for complex non-matching conditions', () => {
    const rule: IRule = {
      _id: 'rule10',
      ruleDefinition: {
        operator: 'AND',
        conditions: [
          {
            operator: '==',
            field: 'transaction.merchant',
            value: 'Walmart',
          },
          {
            operator: '>',
            field: 'transaction.amount',
            value: 100, // This will make it false
          },
        ],
      },
      newCategory: 'Should Not Match',
      __v: 0,
    };
    expect(evaluateRule(mockTransaction, rule)).toBe(false);
  });
});
