import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server directory to ensure same MONGODB_URI
const serverEnvPath = path.join(process.cwd(), 'server', '.env');
dotenv.config({ path: serverEnvPath });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'SchoolHub';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db(DB_NAME);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}
