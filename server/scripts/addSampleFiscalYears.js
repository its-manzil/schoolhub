import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const addSampleFiscalYears = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('SchoolHub');
    
    // Sample fiscal years with BS dates
    const fiscalYears = [
      {
        name: '2081/82',
        startDate: '2024-07-16T00:00:00.000Z', // AD date
        endDate: '2025-07-15T00:00:00.000Z',   // AD date
        isActive: true,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '2080/81',
        startDate: '2023-07-17T00:00:00.000Z',
        endDate: '2024-07-15T00:00:00.000Z',
        isActive: false,
        isLocked: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '2082/83',
        startDate: '2025-07-16T00:00:00.000Z',
        endDate: '2026-07-15T00:00:00.000Z',
        isActive: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await db.collection('fiscalyears').insertMany(fiscalYears);
    console.log(`Added ${result.insertedCount} fiscal years`);
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error adding fiscal years:', error);
    process.exit(1);
  }
};

addSampleFiscalYears();
