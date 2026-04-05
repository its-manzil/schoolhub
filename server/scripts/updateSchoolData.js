import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const updateSchoolData = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('SchoolHub');
    
    // Update the active school with correct data
    const result = await db.collection('schools').updateOne(
      { status: 'active' },
      { 
        $set: {
          panVat: '123456789', // Correct PAN/VAT number
          totalStudents: 250,   // Correct total students
          totalTeachers: 15,    // Correct total teachers
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} school record`);
    
    // Verify the update
    const school = await db.collection('schools').findOne({ status: 'active' });
    console.log('Updated school data:', {
      name: school.name,
      panVat: school.panVat,
      totalStudents: school.totalStudents,
      totalTeachers: school.totalTeachers,
      schoolId: school.schoolId,
      hasLogo: !!school.logo
    });
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error updating school data:', error);
    process.exit(1);
  }
};

updateSchoolData();
