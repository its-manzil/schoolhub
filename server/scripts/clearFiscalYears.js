import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const clearFiscalYears = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('SchoolHub');
    
    const result = await db.collection('fiscalyears').deleteMany({});
    console.log(`Cleared ${result.deletedCount} fiscal years`);
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing fiscal years:', error);
    process.exit(1);
  }
};

clearFiscalYears();
