import type { ITransaction, IRule } from './models';

// Helper to safely get nested field values, including special date functions
function getFieldValue(transaction: ITransaction, fieldPath: string): any {
  if (fieldPath.startsWith('dayOfWeek(transaction.date)')) {
    const date = new Date(transaction.date);
    return date.getDay(); // 0 for Sunday, 6 for Saturday
  }
  if (fieldPath.startsWith('month(transaction.date)')) {
    const date = new Date(transaction.date);
    return date.getMonth() + 1; // 1 for January, 12 for December
  }
  if (fieldPath.startsWith('year(transaction.date)')) {
    const date = new Date(transaction.date);
    return date.getFullYear();
  }
  if (fieldPath.startsWith('day(transaction.date)')) {
    const date = new Date(transaction.date);
    return date.getDate();
  }

  // Generic field access for transaction properties
  let actualFieldPath = fieldPath;
  if (fieldPath.startsWith('transaction.')) {
    actualFieldPath = fieldPath.substring('transaction.'.length);
  }

  const pathParts = actualFieldPath.split('.');
  let value: any = transaction;
  for (const part of pathParts) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[part];
  }
  return value;
}

// Evaluates a single condition or a group of conditions
function evaluateCondition(transaction: ITransaction, condition: any): boolean {
  if (!condition || typeof condition !== 'object') {
    return false;
  }

  const { operator, field, value, conditions } = condition;

  if (conditions && Array.isArray(conditions)) {
    // Logical operators (AND, OR)
    if (operator === 'AND') {
      return conditions.every((cond: any) => evaluateCondition(transaction, cond));
    }
    if (operator === 'OR') {
      return conditions.some((cond: any) => evaluateCondition(transaction, cond));
    }
  } else if (field !== undefined && operator !== undefined && value !== undefined) {
    // Comparison operators
    const fieldValue = getFieldValue(transaction, field);

    switch (operator) {
      case '==': return fieldValue == value;
      case '!=': return fieldValue != value;
      case '>': return fieldValue > value;
      case '<': return fieldValue < value;
      case '>=': return fieldValue >= value;
      case '<=': return fieldValue <= value;
      case 'contains': return typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.includes(value);
      case 'matches': return typeof fieldValue === 'string' && typeof value === 'string' && new RegExp(value, 'i').test(fieldValue);
      default: return false;
    }
  }
  return false;
}

// Main function to evaluate a transaction against a rule
export function evaluateRule(transaction: ITransaction, rule: IRule): boolean {
  if (!rule || !rule.ruleDefinition) {
    return false;
  }
  return evaluateCondition(transaction, rule.ruleDefinition);
}
