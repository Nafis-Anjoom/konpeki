
import mongoose from 'mongoose';
import 'dotenv/config';
import { Transaction, Rule } from './models';

const seedData = {
  transactions: [
    { merchant: 'Walmart', amount: 75.50, date: new Date('2025-10-04T10:00:00Z'), account: 'Checking', category: 'Groceries' },
    { merchant: 'Walmart', amount: 45.00, date: new Date('2025-10-04T11:00:00Z'), account: 'Savings', category: 'Groceries' }, // Should be recategorized to Hardware
    { merchant: 'Starbucks', amount: 5.75, date: new Date('2025-10-03T08:30:00Z'), account: 'Checking', category: 'Food' },
    { merchant: 'Home Depot', amount: 120.00, date: new Date('2025-10-02T14:00:00Z'), account: 'Checking', category: 'Home Improvement' },
    { merchant: 'Shell', amount: 55.25, date: new Date('2025-10-05T18:00:00Z'), account: 'Credit Card', category: 'Gas' },
  ],
  rules: [
    {
      conditions: {
        merchant: 'Walmart',
        dayOfWeek: 6, // Saturday
        maxAmount: 80,
        account: 'Savings'
      },
      newCategory: 'Hardware'
    },
    {
        conditions: {
            merchant: 'Starbucks'
        },
        newCategory: 'Coffee'
    }
  ]
};

const seedDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  await mongoose.connect(mongoUri);

  console.log('Seeding database...');
  await Transaction.deleteMany({});
  await Rule.deleteMany({});

  await Transaction.insertMany(seedData.transactions);
  await Rule.insertMany(seedData.rules);

  console.log('Database seeded!');
  await mongoose.connection.close();
};

seedDB().catch(err => {
  console.error(err);
  process.exit(1);
});
