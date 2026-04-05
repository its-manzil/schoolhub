import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const updateOrganizationWithRealData = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('SchoolHub');
    
    // Get the first active school
    const school = await db.collection('schools').findOne({ status: 'active' });
    
    if (!school) {
      console.log('No active school found in database');
      await client.close();
      process.exit(0);
    }
    
    console.log('Found school:', school.name);
    
    // Update organization with real school data
    const organizationData = {
      companyName: school.name,
      panVat: school.schoolId ? school.schoolId.toString() : '',
      address: school.address || '',
      phone: school.contactPhone || '',
      email: school.contactEmail || '',
      logo: '',
      updatedAt: new Date()
    };
    
    const result = await db.collection('organizations').findOneAndUpdate(
      {},
      { $set: organizationData },
      { returnDocument: 'after', upsert: true }
    );
    
    console.log('Organization updated with real school data:');
    console.log(JSON.stringify(result.value, null, 2));
    
    await client.close();
    console.log('Organization updated successfully with real school data');
    process.exit(0);
  } catch (error) {
    console.error('Error updating organization:', error);
    process.exit(1);
  }
};

updateOrganizationWithRealData();
