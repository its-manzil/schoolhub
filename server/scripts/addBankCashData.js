import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const addBankCashData = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('SchoolHub');
    
    // Add sample bank-cash accounts
    const bankCashAccounts = [
      { name: 'Main Bank Account', type: 'bank', balance: 50000, accountNumber: '1234567890', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cash on Hand', type: 'cash', balance: 15000, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Petty Cash', type: 'cash', balance: 5000, createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const account of bankCashAccounts) {
      const existing = await db.collection('bankcashes').findOne({ name: account.name });
      if (!existing) {
        await db.collection('bankcashes').insertOne(account);
        console.log('Created bank-cash account:', account.name);
      } else {
        console.log('Bank-cash account already exists:', account.name);
      }
    }

    await client.close();
    console.log('Sample bank-cash data added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding bank-cash data:', error);
    process.exit(1);
  }
};

addBankCashData();
