# Smart Transaction Categorizer

![Smart Transaction Categorizer Screenshot](assets/Screenshot%20From%202025-10-05%2005-04-16.png)

## Summary

**Smart Transaction Categorizer** is a full-stack web application that helps users organize their financial transactions automatically. Instead of relying on static categories, users can define **custom rules** using a simple **DSL (Domain Specific Language)**. These rules evaluate transaction properties like merchant, amount, date, and account, dynamically reassigning categories in real time.

Key features include:

* Dynamic rule creation and editing via a DSL
* Instant category updates when rules change
* Support for multiple conditions per rule (AND/OR logic)
* Lightweight, responsive UI built with React and Tailwind

---

## Project Structure

* **`server/`**: Backend powered by Bun, Express-like routing, MongoDB, and Mongoose. Handles API endpoints, rule evaluation, and transaction storage.
* **`client/`**: Frontend built with React, TypeScript, Vite, and Tailwind CSS. Provides a responsive UI to view transactions, create rules, and see categories update in real time.

---

## Features & Screenshots

* **Transaction Table:** Displays all transactions with dynamic category labels.
* **Rule Builder:** Create rules with multiple conditions (merchant, day, amount, account) and assign categories.
* **Live Categorization:** Instantly updates transactions when rules are added or modified.
* **Optional Seed Data:** Quickly populate the app with example transactions for demo purposes.

![Rules Example Screenshot](assets/Screenshot_Rules.png)

---

## DSL Grammar for Rule Evaluation

The **DSL (Domain Specific Language)** in this project allows users to define rules for categorizing transactions. Each rule is stored as a string (`rule.ruleDefinition`) and dynamically parsed and evaluated by the backend.

### DSL Structure

A rule is composed of two parts, separated by `->`:

```
`condition_expression` -> `newCategory`
```

1. **`condition_expression`**: A JavaScript-like expression that evaluates to `true` or `false`. It has access to:

   * The `transaction` object (type `ITransaction`)
   * Predefined helper functions in `dslHelpers`

2. **`newCategory`**: A string literal representing the category assigned if the condition evaluates to `true`.

---

### `condition_expression` Details

Supports standard JavaScript syntax:

* **Access transaction properties:** `transaction.amount`, `transaction.description`, `transaction.merchant.name`, `transaction.date`
* **Comparison operators:** `===`, `!==`, `<`, `>`, `<=`, `>=`
* **Logical operators:** `&&`, `||`, `!`
* **Arithmetic operators:** `+`, `-`, `*`, `/`, `%`
* **String methods:** `includes()`, `startsWith()`, `toLowerCase()`
* **Number methods** and standard arithmetic
* **Parentheses for grouping**
* **Ternary operator:** `condition ? value1 : value2`

---

### Available `dslHelpers`

* `dslHelpers.dayOfWeek(date)`: Returns 0 (Sunday)–6 (Saturday)
* `dslHelpers.month(date)`: Returns 1–12
* `dslHelpers.year(date)`: Returns full year
* `dslHelpers.day(date)`: Day of the month
* `dslHelpers.isWeekend(date)`: `true` if Saturday or Sunday
* `dslHelpers.getWeekNumber(date)`: ISO week number
* `dslHelpers.isDateBetween(date, startDateString, endDateString)`: `true` if date is within the range

---

### Example DSL Rule

```
`transaction.amount > 100 && transaction.merchant.name.includes('Amazon') || dslHelpers.isWeekend(transaction.date)` -> `Shopping`
```

This rule:

1. Checks if `transaction.amount > 100` AND merchant includes "Amazon"
2. OR checks if the transaction date falls on a weekend
3. If either is `true`, assigns the category `Shopping`

---

## Setup and Run Instructions

### Prerequisites

- Node.js (for client dependencies)
- Bun (for server)
- MongoDB instance (local or cloud)

### Backend Setup (server/)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Create a `.env` file in the `server` directory based on `.env.example` and provide your MongoDB URI:
    ```
    MONGO_URI="your_mongodb_connection_string"
    ```
4.  Run the seed script (optional, for initial data):
    ```bash
    bun run seed
    ```
5.  Start the backend server:
    ```bash
    bun run dev
    ```

### Frontend Setup (client/)

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```

### Full Stack

1.  Ensure both backend and frontend servers are running in separate terminals.
2.  Open your browser to `http://localhost:5173` (or whatever port the client starts on).

## API Endpoints

### Transactions

- `GET /api/transactions`: Fetch all transactions.
- `POST /api/transactions`: Add a new transaction.

### Rules

- `GET /api/rules`: Fetch all rules.
- `POST /api/rules`: Add a new rule.

### Categorization

- `POST /api/reapply-rules`: Re-categorize transactions based on defined rules.
