import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const addSampleData = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('SchoolHub');
    
    console.log('Connected to MongoDB - Database: SchoolHub');
    
    // Add sample organization
    const orgCollection = db.collection('organizations');
    const existingOrg = await orgCollection.findOne();
    
    if (!existingOrg) {
      const org = {
        companyName: "Nepal Secondary School",
        panVat: "123456789",
        address: "Kathmandu, Nepal",
        phone: "+977-01412345",
        email: "info@nepalsecondary.edu.np",
        logo: "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await orgCollection.insertOne(org);
      console.log('Organization created with ID:', result.insertedId);
    } else {
      console.log('Organization already exists:', existingOrg);
    }

    // Add sample fiscal year
    const fiscalYearCollection = db.collection('fiscalyears');
    const existingFiscalYear = await fiscalYearCollection.findOne({ name: "2081/82" });
    
    if (!existingFiscalYear) {
      const fiscalYear = {
        name: "2081/82",
        startDate: new Date("2024-07-16"),
        endDate: new Date("2025-07-15"),
        isActive: true,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await fiscalYearCollection.insertOne(fiscalYear);
      console.log('Fiscal Year created with ID:', result.insertedId);
    } else {
      console.log('Fiscal Year already exists:', existingFiscalYear);
    }

    // Add sample Chart of Accounts
    const coaCollection = db.collection('chartofaccounts');
    const accounts = [
      { name: "Cash", type: "asset", parentId: null, code: "1001" },
      { name: "Bank Account", type: "asset", parentId: null, code: "1002" },
      { name: "Accounts Receivable", type: "asset", parentId: null, code: "1003" },
      { name: "Furniture & Fixtures", type: "asset", parentId: null, code: "1004" },
      { name: "Accounts Payable", type: "liability", parentId: null, code: "2001" },
      { name: "Tuition Fee Income", type: "income", parentId: null, code: "3001" },
      { name: "Stationery Income", type: "income", parentId: null, code: "3002" },
      { name: "Salary Expense", type: "expense", parentId: null, code: "4001" },
      { name: "Rent Expense", type: "expense", parentId: null, code: "4002" },
      { name: "Utilities Expense", type: "expense", parentId: null, code: "4003" }
    ];

    for (const account of accounts) {
      const existingAccount = await coaCollection.findOne({ code: account.code });
      if (!existingAccount) {
        const accountWithTimestamps = {
          ...account,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await coaCollection.insertOne(accountWithTimestamps);
        console.log(`Account created: ${account.name} with ID: ${result.insertedId}`);
      } else {
        console.log(`Account already exists: ${account.name}`);
      }
    }

    console.log('Sample data added successfully!');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
};

addSampleData();
