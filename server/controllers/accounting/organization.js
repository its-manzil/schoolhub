import { getDB } from '../../config/db.js';
import { getSchoolId } from '../../utils/token.js';

export const getOrganization = async (req, res) => {
  try {
    const db = getDB();
    
    // Get the logged-in user's school ID
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      // If no school ID found, return existing organization or create default
      const org = await db.collection('organizations').findOne();
      return res.status(200).json(org);
    }
    
    // Get the school that belongs to the logged-in user
    const school = await db.collection('schools').findOne({ schoolId: schoolId });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    // Transform school data to organization format with proper field mapping
    const organizationData = {
      _id: school._id,
      companyName: school.name || '',
      panVat: school.panVat || school.taxId || school.panNumber || '',
      address: school.address || school.officeAddress || '',
      phone: school.contactPhone || school.phone || '',
      email: school.contactEmail || school.email || '',
      logo: school.logo || '',
      establishedYear: school.establishedYear || '',
      principalName: school.principalName || '',
      totalStudents: school.totalStudents || 0,
      totalTeachers: school.totalTeachers || 0,
      status: school.status || '',
      schoolId: school.schoolId || '',
      createdAt: school.createdAt,
      updatedAt: school.updatedAt
    };
    
    res.status(200).json(organizationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveOrganization = async (req, res) => {
  try {
    const db = getDB();
    const { panVat } = req.body;
    
    // Get the logged-in user's school ID
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(404).json({ message: 'School ID not found' });
    }
    
    // Update organizations collection
    const org = await db.collection('organizations').findOneAndUpdate(
      {},
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after', upsert: true }
    );
    
    // Also update school record if PAN/VAT is being updated
    if (panVat) {
      await db.collection('schools').updateOne(
        { schoolId: schoolId },
        { 
          $set: { 
            panVat: panVat,
            updatedAt: new Date()
          }
        }
      );
    }
    
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
