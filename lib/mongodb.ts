import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolhub';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    console.log('DB: Using cached connection');
    return { client: cachedClient, db: cachedDb };
  }

  console.log('DB: Connecting to MongoDB...');
  console.log('DB: URI exists:', !!MONGODB_URI);
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db();
  console.log('DB: Connected successfully to database:', db.databaseName);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
