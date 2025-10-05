import { ITransaction, IRule } from './models';

// Helper functions that can be used within the DSL
const dslHelpers = {
  dayOfWeek: (date: Date) => new Date(date).getDay(), // 0 for Sunday, 6 for Saturday
  month: (date: Date) => new Date(date).getMonth() + 1, // 1 for January, 12 for December
  year: (date: Date) => new Date(date).getFullYear(),
  day: (date: Date) => new Date(date).getDate(),
  // Add more helpers as needed, e.g., transaction.merchant.toLowerCase().includes("walmart")
  // For 'contains' and 'matches' we can rely on JS string methods or regex directly in the DSL
};

// Cache for compiled rule functions to avoid recompilation
const ruleFunctionCache = new Map<string, Function>();

export function evaluateRule(transaction: ITransaction, rule: IRule): boolean {
  console.log('Evaluating rule:', rule.ruleDefinition, 'for transaction:', transaction.id);
  if (!rule || !rule.ruleDefinition) {
    console.log('Rule or ruleDefinition is missing.');
    return false;
  }

  const parts = rule.ruleDefinition.split('->');
  if (parts.length !== 2) {
    console.error('Invalid ruleDefinition format. Expected "condition -> newCategory"');
    return false;
  }

  const conditionString = parts[0].trim();
  console.log('Condition string:', conditionString);

  let compiledFunction = ruleFunctionCache.get(conditionString);

  if (!compiledFunction) {
    console.log('Compiling new function for condition:', conditionString);
    try {
      compiledFunction = new Function(
        'transaction',
        ...Object.keys(dslHelpers),
        `return ${conditionString};`
      );
      ruleFunctionCache.set(conditionString, compiledFunction);
      console.log('Function compiled successfully.');
    } catch (e) {
      console.error(`Error compiling rule: "${conditionString}"`, e);
      return false;
    }
  }

  try {
    const result = compiledFunction(
      transaction,
      ...Object.values(dslHelpers)
    );
    console.log('Evaluation result:', result);
    return !!result;
  } catch (e) {
    console.error(`Error evaluating rule: "${conditionString}" for transaction ID: ${transaction.id}`, e);
    return false;
  }
}

// Export the dslHelpers for potential use in tests or documentation
export { dslHelpers };