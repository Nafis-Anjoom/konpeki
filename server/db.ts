import { ITransaction, IRule } from './models';

// In-memory storage for transactions and rules
export const inMemoryTransactions: ITransaction[] = [];
export const inMemoryRules: IRule[] = [];

// This function is now a no-op as we are using in-memory storage
const connectDB = async () => {
  console.log('Using in-memory storage. No database connection needed.');
};

export default connectDB;