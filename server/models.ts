export interface ITransaction {
  id: string; // Added for in-memory unique identification
  merchant: string;
  amount: number;
  date: Date;
  account: string;
  category: string;
}

export interface IRule {
  id: string; // Added for in-memory unique identification
  ruleDefinition: string; // Changed to string for DSL
}
