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
  if (!rule || !rule.ruleDefinition) {
    return false;
  }

  // Split the ruleDefinition into condition and newCategory
  const parts = rule.ruleDefinition.split('->');
  if (parts.length !== 2) {
    console.error('Invalid ruleDefinition format. Expected "condition -> newCategory"');
    return false;
  }

  const conditionString = parts[0].trim();
  // The newCategory is already stored in rule.newCategory, so we only need the condition

  let compiledFunction = ruleFunctionCache.get(conditionString);

  if (!compiledFunction) {
    try {
      // Create a function dynamically from the condition string
      // This function will be executed in a controlled scope
      // WARNING: This is a security risk if ruleDefinition comes from untrusted sources.
      // For a hackathon, it's a quick way to get a flexible DSL. (Acknowledged)
      compiledFunction = new Function(
        'transaction',
        ...Object.keys(dslHelpers),
        `return ${conditionString};`
      );
      ruleFunctionCache.set(conditionString, compiledFunction);
    } catch (e) {
      console.error(`Error compiling rule: "${conditionString}"`, e);
      return false;
    }
  }

  try {
    // Execute the compiled function with the transaction and helpers
    const result = compiledFunction(
      transaction,
      ...Object.values(dslHelpers)
    );
    return !!result; // Ensure boolean return
  } catch (e) {
    console.error(`Error evaluating rule: "${conditionString}" for transaction ID: ${transaction.id}`, e);
    return false;
  }
}

// Export the dslHelpers for potential use in tests or documentation
export { dslHelpers };