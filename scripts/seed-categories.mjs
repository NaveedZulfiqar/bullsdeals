import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const categories = [
  { name: 'Advertisement', type: 'EXPENSE' },
  { name: 'Bank Charges', type: 'EXPENSE' },
  { name: 'Board Fee', type: 'EXPENSE' },
  { name: 'Car Purchase', type: 'EXPENSE' },
  { name: 'Car Repair', type: 'EXPENSE' },
  { name: 'Cleaner', type: 'EXPENSE' },
  { name: 'Commission Expense', type: 'EXPENSE' },
  { name: 'Condo Fee', type: 'EXPENSE' },
  { name: 'Credit card annual fee', type: 'EXPENSE' },
  { name: 'Desk Fee', type: 'INCOME' },
  { name: 'Entertainment', type: 'EXPENSE' },
  { name: 'Equipment Purchase', type: 'EXPENSE' },
  { name: 'Food', type: 'EXPENSE' },
  { name: 'Franchise Fee Monthly', type: 'EXPENSE' },
  { name: 'Furniture', type: 'EXPENSE' },
  { name: 'Gas', type: 'EXPENSE' },
  { name: 'Government Fee', type: 'EXPENSE' },
  { name: 'Handyman', type: 'EXPENSE' },
  { name: 'Interest Car Loan', type: 'EXPENSE' },
  { name: 'Interest Mortgage', type: 'EXPENSE' },
  { name: 'Lease Car', type: 'EXPENSE' },
  { name: 'Lease Equipment', type: 'EXPENSE' },
  { name: 'Lease Office', type: 'EXPENSE' },
  { name: 'Lease Printer', type: 'EXPENSE' },
  { name: 'Legal Fee', type: 'EXPENSE' },
  { name: 'Liability Insurance', type: 'EXPENSE' },
  { name: 'Manager/Trainer on Contract', type: 'EXPENSE' },
  { name: 'Office Maintenance', type: 'EXPENSE' },
  { name: 'Office renovation', type: 'EXPENSE' },
  { name: 'Office Sign', type: 'EXPENSE' },
  { name: 'Office Supply', type: 'EXPENSE' },
  { name: 'Payroll', type: 'EXPENSE' },
  { name: 'RECO Fee', type: 'EXPENSE' },
  { name: 'Rent Receivables', type: 'INCOME' },
  { name: 'Split Fee', type: 'INCOME' },
  { name: 'Commission Income', type: 'INCOME' },
  { name: 'Referral Fees', type: 'INCOME' },
  { name: 'Software Purchase', type: 'EXPENSE' },
  { name: 'Software Subscription', type: 'EXPENSE' },
  { name: 'Transaction Fee', type: 'INCOME' },
  { name: 'Utilities', type: 'EXPENSE' }
];

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['EXPENSE', 'INCOME'] }
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const cat of categories) {
      try {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`Category already exists: ${cat.name}`);
        } else {
          console.error(`Error creating ${cat.name}:`, err.message);
        }
      }
    }

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Error connecting or seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
