import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Simple, direct Firebase functions that bypass the complex API layer
 */

export const directGetAllJobs = async () => {
  try {
    console.log('🔄 Direct: Attempting to get jobs...');
    
    // Try main jobs collection first
    try {
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      
      if (!snapshot.empty) {
        const jobs = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          jobs.push({
            id: doc.id,
            vehicleNumber: data.vehicleNumber || 'Unknown',
            customerName: data.customerName || 'Unknown Customer',
            phoneNumber: data.phoneNumber || 'No Phone',
            vehicleType: data.vehicleType || 'Car',
            services: data.services || ['Service'],
            lastService: data.lastService || (data.services && data.services[0]) || 'Service',
            jobDateTime: data.job_datetime?.toDate ? data.job_datetime.toDate().toISOString() : new Date().toISOString()
          });
        });
        console.log(`✅ Direct: Found ${jobs.length} jobs in main collection`);
        return jobs;
      }
    } catch (mainError) {
      console.log('⚠️ Direct: Main jobs collection error:', mainError.message);
    }
    
    // Try customers subcollections
    console.log('🔄 Direct: Trying customer subcollections...');
    const customersRef = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersRef);
    
    const allJobs = [];
    for (const customerDoc of customersSnapshot.docs) {
      const customerData = customerDoc.data();
      try {
        const jobsRef = collection(db, 'customers', customerDoc.id, 'jobs');
        const jobsSnapshot = await getDocs(jobsRef);
        
        jobsSnapshot.forEach(jobDoc => {
          const jobData = jobDoc.data();
          allJobs.push({
            id: jobDoc.id,
            vehicleNumber: customerDoc.id,
            customerName: customerData.full_name || 'Unknown Customer',
            phoneNumber: customerData.mobile_number || 'No Phone',
            vehicleType: customerData.vehicle_type || 'Car',
            services: jobData.services || ['Service'],
            lastService: jobData.services && jobData.services[0] || 'Service',
            jobDateTime: jobData.job_datetime?.toDate ? jobData.job_datetime.toDate().toISOString() : new Date().toISOString()
          });
        });
      } catch (subError) {
        console.log(`⚠️ Direct: Error with customer ${customerDoc.id}:`, subError.message);
      }
    }
    
    allJobs.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime));
    console.log(`✅ Direct: Found ${allJobs.length} jobs total`);
    return allJobs;
    
  } catch (error) {
    console.error('❌ Direct: Error getting jobs:', error);
    return [];
  }
};

export const directAddSampleData = async () => {
  try {
    console.log('🔄 Direct: Adding sample data...');
    
    const sampleData = [
      {
        vehicleNumber: 'ABC-1234',
        customer: {
          full_name: 'John Silva',
          mobile_number: '077-123-4567',
          address: 'No. 123, Galle Road, Colombo 03',
          vehicle_model: 'Toyota Prius',
          nic_number: '199012345678',
          birthday: '1990-01-15',
          vehicle_type: 'Car',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        job: {
          services: ['Oil Change', 'Filter Replacement'],
          job_datetime: serverTimestamp(),
          created_at: serverTimestamp(),
          technician_name: 'Sunil Perera',
          cost: 3500,
          status: 'Completed',
          notes: 'Regular maintenance service'
        }
      },
      {
        vehicleNumber: 'XYZ-5678',
        customer: {
          full_name: 'Priya Fernando',
          mobile_number: '070-987-6543',
          address: 'No. 456, Kandy Road, Malabe',
          vehicle_model: 'Honda Civic',
          nic_number: '198512345678',
          birthday: '1985-05-20',
          vehicle_type: 'Car',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        },
        job: {
          services: ['Brake Inspection', 'Tire Rotation'],
          job_datetime: serverTimestamp(),
          created_at: serverTimestamp(),
          technician_name: 'Kamal Jayasinghe',
          cost: 2800,
          status: 'Completed',
          notes: 'Brake pads in good condition'
        }
      }
    ];

    for (const data of sampleData) {
      // Add customer
      const customerRef = doc(db, 'customers', data.vehicleNumber);
      await setDoc(customerRef, data.customer);

      // Add job to customer's subcollection
      const jobsRef = collection(db, 'customers', data.vehicleNumber, 'jobs');
      await addDoc(jobsRef, data.job);

      // Also add to main jobs collection
      const mainJobsRef = collection(db, 'jobs');
      await addDoc(mainJobsRef, {
        ...data.job,
        vehicleNumber: data.vehicleNumber,
        customerName: data.customer.full_name,
        phoneNumber: data.customer.mobile_number,
        vehicleType: data.customer.vehicle_type
      });
    }
    
    console.log('✅ Direct: Sample data added successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Direct: Error adding sample data:', error);
    return false;
  }
};
