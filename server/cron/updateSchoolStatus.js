import { getDB } from '../config/db.js';

/**
 * CRON Job: Update School Status
 * 
 * Run daily at midnight (0 0 * * *)
 * Updates school statuses based on subscription dates:
 * - Active → Pending (when endDate passes, 15 day grace period)
 * - Pending → Inactive (after 15 day grace period expires)
 */

// Helper function to update school status based on dates
function getUpdatedStatus(school) {
  const today = new Date();
  const expiryDate = new Date(school.subscription?.expiryDate);
  const pendingUntil = school.pendingUntil ? new Date(school.pendingUntil) : null;
  const trialEndsAt = school.trialEndsAt ? new Date(school.trialEndsAt) : null;
  
  let status = school.status || 'active';
  let newPendingUntil = school.pendingUntil;
  let isTrial = school.isTrial;
  
  // Handle trial expiration - move to pending (grace period)
  if (status === 'trial' && trialEndsAt && today > trialEndsAt) {
    status = 'pending';
    const gracePeriodEnd = new Date(today);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 15);
    newPendingUntil = gracePeriodEnd.toISOString();
    isTrial = false;
    console.log(`School ${school.schoolId} (${school.name}): Trial → Pending (grace until ${newPendingUntil})`);
  }
  
  // If expired and still active, move to pending
  if (today > expiryDate && status === 'active') {
    status = 'pending';
    const gracePeriodEnd = new Date(expiryDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 15);
    newPendingUntil = gracePeriodEnd.toISOString();
    console.log(`School ${school.schoolId} (${school.name}): Active → Pending (grace until ${newPendingUntil})`);
  }
  
  // If pending period expired, move to inactive
  if (status === 'pending' && pendingUntil && today > pendingUntil) {
    status = 'inactive';
    newPendingUntil = null;
    console.log(`School ${school.schoolId} (${school.name}): Pending → Inactive`);
  }
  
  return { 
    status, 
    pendingUntil: newPendingUntil,
    isTrial,
    gracePeriodDays: status === 'pending' && newPendingUntil 
      ? Math.max(0, Math.ceil((new Date(newPendingUntil).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      : 0
  };
}

// Main function to update all school statuses
export async function updateAllSchoolStatuses() {
  try {
    const db = getDB();
    console.log(`[${new Date().toISOString()}] Starting school status update job...`);
    
    // Get all schools
    const schools = await db.collection('schools').find({}).toArray();
    console.log(`Found ${schools.length} schools to check`);
    
    let updatedCount = 0;
    const updates = [];
    
    for (const school of schools) {
      const statusUpdate = getUpdatedStatus(school);
      
      // Only update if status or pendingUntil changed
      if (statusUpdate.status !== school.status || statusUpdate.pendingUntil !== school.pendingUntil || statusUpdate.isTrial !== school.isTrial) {
        await db.collection('schools').updateOne(
          { _id: school._id },
          { 
            $set: { 
              status: statusUpdate.status,
              pendingUntil: statusUpdate.pendingUntil,
              isTrial: statusUpdate.isTrial,
              updatedAt: new Date().toISOString()
            } 
          }
        );
        
        updates.push({
          schoolId: school.schoolId,
          name: school.name,
          oldStatus: school.status,
          newStatus: statusUpdate.status,
          pendingUntil: statusUpdate.pendingUntil
        });
        
        updatedCount++;
      }
    }
    
    console.log(`[${new Date().toISOString()}] Status update complete. Updated ${updatedCount} schools.`);
    
    if (updates.length > 0) {
      console.log('Updates:', updates);
    }
    
    return {
      success: true,
      totalSchools: schools.length,
      updatedCount,
      updates,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in updateAllSchoolStatuses:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run immediately if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('Running school status update job...');
  updateAllSchoolStatuses()
    .then(result => {
      console.log('Job result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Job failed:', error);
      process.exit(1);
    });
}

export default updateAllSchoolStatuses;
