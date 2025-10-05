# DSL Grammar for Rule Evaluation

The DSL (Domain Specific Language) in this project is used to define rules for categorizing transactions. It is embedded within a string called `rule.ruleDefinition` and is dynamically parsed and evaluated.

## DSL Structure

A DSL rule is composed of two main parts, separated by `->`:

```
`condition_expression` -> `newCategory`
```

1.  **`condition_expression`**: This is a JavaScript-like expression that evaluates to a boolean value (`true` or `false`). It has access to:
    *   The `transaction` object (of type `ITransaction`).
    *   A set of predefined helper functions from `dslHelpers`.

2.  **`newCategory`**: This is a string literal that represents the new category to be assigned to the transaction if the `condition_expression` evaluates to `true`.

## `condition_expression` Details

The `condition_expression` is essentially a standard JavaScript expression that is dynamically compiled and executed. This means it supports common JavaScript syntax and features, including:

*   **Accessing `transaction` properties**: You can access properties of the `transaction` object directly, such as:
    *   `transaction.amount`
    *   `transaction.description`
    *   `transaction.merchant.name`
    *   `transaction.date`
    *   And any other properties defined in the `ITransaction` interface.

*   **Comparison operators**:
    *   `===` (strict equality)
    *   `!==` (strict inequality)
    *   `<` (less than)
    *   `>` (greater than)
    *   `<=` (less than or equal to)
    *   `>=` (greater than or equal to)

*   **Logical operators**:
    *   `&&` (logical AND)
    *   `||` (logical OR)
    *   `!` (logical NOT)

*   **Arithmetic operators**:
    *   `+`, `-`, `*`, `/`, `%`

*   **String methods**: Standard JavaScript string methods can be used, for example:
    *   `transaction.description.includes('keyword')`
    *   `transaction.merchant.name.toLowerCase()`
    *   `transaction.merchant.name.startsWith('prefix')`

*   **Number methods**: Standard JavaScript number methods can be used.

*   **Parentheses for grouping**: `()` can be used to control the order of operations.

*   **Ternary operator**: `condition ? value1 : value2`

## Available `dslHelpers`

The following helper functions are available within the `condition_expression` and can be called using the `dslHelpers.` prefix:

*   `dslHelpers.dayOfWeek(date: Date)`: Returns the day of the week for the given `Date` object (0 for Sunday, 6 for Saturday, based on UTC).
*   `dslHelpers.month(date: Date)`: Returns the month for the given `Date` object (1 for January, 12 for December, based on UTC).
*   `dslHelpers.year(date: Date)`: Returns the full year for the given `Date` object (based on UTC).
*   `dslHelpers.day(date: Date)`: Returns the day of the month for the given `Date` object (based on UTC).
*   `dslHelpers.isWeekend(date: Date)`: Returns `true` if the given `Date` object falls on a Saturday or Sunday (based on UTC), `false` otherwise.
*   `dslHelpers.getWeekNumber(date: Date)`: Returns the ISO week number for the given `Date` object.
*   `dslHelpers.isDateBetween(date: Date, startDateString: string, endDateString: string)`: Returns `true` if the `date` is chronologically between `startDateString` and `endDateString` (inclusive). Both `startDateString` and `endDateString` should be valid date strings parseable by `new Date()`.

## Example DSL Rule

```
`transaction.amount > 100 && transaction.merchant.name.includes('Amazon') || dslHelpers.isWeekend(transaction.date)` -> `Shopping`
```

This rule would:
1.  Check if the `transaction.amount` is greater than 100 AND the `transaction.merchant.name` includes the string 'Amazon'.
2.  OR, it checks if the `transaction.date` falls on a weekend using the `dslHelpers.isWeekend` function.
3.  If either of these conditions is `true`, the transaction will be assigned the category `Shopping`.
