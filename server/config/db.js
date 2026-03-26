import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db;

const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    db = client.db('SchoolHub');
    console.log('Connected to MongoDB - Database: SchoolHub');
    
    // Verify connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(col => col.name));
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
};

export { connectToMongoDB };
