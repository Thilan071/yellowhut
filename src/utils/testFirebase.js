import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    console.log('🔥 Database instance:', db);
    
    // Test basic connectivity with customers collection
    console.log('🔥 Testing customers collection...');
    const customersCollection = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersCollection);
    console.log('🔥 Customers collection snapshot:', customersSnapshot);
    
    const customersData = [];
    customersSnapshot.forEach((doc) => {
      customersData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Test jobs collection
    console.log('🔥 Testing jobs collection...');
    let jobsData = [];
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsCollection);
      jobsSnapshot.forEach((doc) => {
        jobsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } catch (jobsError) {
      console.log('🔥 Jobs collection not found or error:', jobsError.message);
    }
    
    return {
      success: true,
      message: `Firebase connection successful!\nCustomers: ${customersSnapshot.size} documents\nJobs: ${jobsData.length} documents`,
      data: {
        customers: {
          count: customersSnapshot.size,
          data: customersData
        },
        jobs: {
          count: jobsData.length,
          data: jobsData
        }
      }
    };
    
  } catch (error) {
    console.error('🔥 Firebase connection failed:', error);
    return {
      success: false,
      message: `Firebase connection failed: ${error.message}`,
      error: error
    };
  }
};
