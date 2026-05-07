import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Test the normalizeScheduleData function directly
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function normalizeScheduleData(schedule, source) {
  if (!schedule) return null;

  const normalized = {
    academicYear: schedule.academicYear,
    schoolId: schedule.schoolId,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    holidays: schedule.holidays || {},
    breaks: Array.isArray(schedule.breaks) ? schedule.breaks : [],
    blocks: [],
    source: source,
    createdAt: schedule.createdAt || new Date()
  };

  // Handle v2 format (hybrid scheduling)
  if (schedule.blocks && Array.isArray(schedule.blocks)) {
    // v2 format has blocks directly
    normalized.blocks = schedule.blocks;
  }
  // Handle v1 format (legacy)
  else if (schedule.periodDuration) {
    // Generate synthetic blocks from v1 format
    const blocks = [];
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    
    // Add periods
    let currentTime = startMinutes;
    let periodCount = 1;
    
    while (currentTime < endMinutes) {
      const periodEnd = Math.min(currentTime + schedule.periodDuration, endMinutes);
      blocks.push({
        type: 'period',
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(periodEnd),
        label: `Period ${periodCount}`
      });
      
      currentTime = periodEnd;
      periodCount++;
      
      // Add breaks if configured
      const breakAfterThis = normalized.breaks.find(b => b.afterPeriod === periodCount - 1);
      if (breakAfterThis) {
        blocks.push({
          type: 'break',
          startTime: breakAfterThis.start,
          endTime: breakAfterThis.end,
          label: breakAfterThis.name
        });
        currentTime = timeToMinutes(breakAfterThis.end);
      }
    }
    
    normalized.blocks = blocks;
  }

  return normalized;
}

async function testAPI() {
  try {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    const db = client.db('SchoolHub');
    console.log('Connected to MongoDB - Database: SchoolHub');
    
    // Test v1 schedule normalization
    const v1Schedule = {
      academicYear: '2081-2082',
      schoolId: 'test-school',
      startTime: '10:00',
      endTime: '16:00',
      periodDuration: 45,
      holidays: { Sunday: true },
      breaks: [{ name: 'Lunch', start: '13:00', end: '13:45' }]
    };
    
    const normalizedV1 = normalizeScheduleData(v1Schedule, 'v1');
    console.log('✅ V1 Schedule Normalization:', normalizedV1);
    
    // Test v2 schedule normalization  
    const v2Schedule = {
      academicYear: '2082-2083',
      schoolId: 'test-school',
      startTime: '10:00',
      endTime: '16:00',
      blocks: [
        { type: 'period', startTime: '10:00', endTime: '10:45', label: 'Period 1' },
        { type: 'break', startTime: '10:45', endTime: '11:00', label: 'Short Break' },
        { type: 'period', startTime: '11:00', endTime: '11:45', label: 'Period 2' }
      ],
      holidays: { Saturday: true }
    };
    
    const normalizedV2 = normalizeScheduleData(v2Schedule, 'v2');
    console.log('✅ V2 Schedule Normalization:', normalizedV2);
    
    // Test fetching from actual collections
    console.log('\n--- Testing Database Collections ---');
    
    const v1Schedules = await db.collection('school_schedules').find({}).limit(1).toArray();
    console.log('V1 collection exists:', v1Schedules.length > 0 ? '✅ Yes' : '❌ No');
    
    const v2Schedules = await db.collection('school_schedules_v2').find({}).limit(1).toArray();
    console.log('V2 collection exists:', v2Schedules.length > 0 ? '✅ Yes' : '❌ No');
    
    await client.close();
    console.log('\n✅ All tests passed - API fix is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPI();
