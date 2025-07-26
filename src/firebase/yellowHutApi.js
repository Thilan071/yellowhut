import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";

/**
 * YellowHut Customer Service Firebase API
 * 
 * Database Structure:
 * - customers collection (vehicle_number as document ID)
 *   - full_name, mobile_number, address, vehicle_model, nic_number, birthday
 *   - jobs subcollection
 *     - job_datetime, services[]
 */

const CUSTOMERS_COLLECTION = "customers";
const JOBS_SUBCOLLECTION = "jobs";

/**
 * Search for a customer by vehicle number
 * @param {string} vehicleNumber - Vehicle number to search for
 * @returns {Object|null} Customer data with service history or null if not found
 */
export const searchCustomer = async (vehicleNumber) => {
  try {
    const vehicleId = vehicleNumber.toUpperCase();
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleId);
    const customerSnap = await getDoc(customerRef);
    
    if (!customerSnap.exists()) {
      return null;
    }
    
    const customerData = customerSnap.data();
    
    let serviceHistory = [];
    
    // First, try to get service history from jobs subcollection
    try {
      const jobsRef = collection(db, CUSTOMERS_COLLECTION, vehicleId, JOBS_SUBCOLLECTION);
      const jobsQuery = query(jobsRef, orderBy("job_datetime", "desc"));
      const jobsSnap = await getDocs(jobsQuery);
      
      jobsSnap.forEach((jobDoc) => {
        const jobData = jobDoc.data();
        serviceHistory.push({
          id: jobDoc.id,
          jobDateTime: jobData.job_datetime?.toDate ? jobData.job_datetime.toDate().toISOString() : new Date().toISOString(),
          services: jobData.services || []
        });
      });
      
      console.log(`📋 Found ${serviceHistory.length} jobs in customer subcollection for ${vehicleId}`);
    } catch (subError) {
      console.log(`⚠️ Error fetching from subcollection for ${vehicleId}:`, subError.message);
    }
    
    // If no jobs found in subcollection, try main jobs collection
    if (serviceHistory.length === 0) {
      try {
        console.log(`🔍 Searching main jobs collection for vehicle ${vehicleId}...`);
        const mainJobsRef = collection(db, 'jobs');
        const mainJobsQuery = query(
          mainJobsRef, 
          orderBy("job_datetime", "desc")
        );
        const mainJobsSnap = await getDocs(mainJobsQuery);
        
        mainJobsSnap.forEach((jobDoc) => {
          const jobData = jobDoc.data();
          // Check if this job belongs to the current vehicle
          if (jobData.vehicleNumber === vehicleId) {
            serviceHistory.push({
              id: jobDoc.id,
              jobDateTime: jobData.job_datetime?.toDate ? jobData.job_datetime.toDate().toISOString() : 
                          (jobData.jobDateTime || new Date().toISOString()),
              services: jobData.services || []
            });
          }
        });
        
        console.log(`📋 Found ${serviceHistory.length} jobs in main collection for ${vehicleId}`);
      } catch (mainError) {
        console.log(`⚠️ Error fetching from main jobs collection:`, mainError.message);
      }
    }
    
    // Sort by date (most recent first)
    serviceHistory.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime));
    
    // Transform to component format
    return {
      id: vehicleId,
      fullName: customerData.full_name,
      mobileNumber: customerData.mobile_number,
      address: customerData.address,
      vehicleModel: customerData.vehicle_model,
      vehicleNumber: vehicleId,
      nicNumber: customerData.nic_number,
      birthday: customerData.birthday,
      vehicleType: customerData.vehicle_type || 'Car',
      serviceHistory: serviceHistory
    };
    
  } catch (error) {
    console.error("Error searching customer:", error);
    throw new Error(`Failed to search customer: ${error.message}`);
  }
};

/**
 * Register a new customer
 * @param {string} vehicleNumber - Vehicle number (will be used as document ID)
 * @param {Object} customerData - Customer information
 * @returns {Object} Registered customer data
 */
export const registerNewCustomer = async (vehicleNumber, customerData) => {
  try {
    const vehicleId = vehicleNumber.toUpperCase();
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleId);
    
    // Check if customer already exists
    const existingCustomer = await getDoc(customerRef);
    if (existingCustomer.exists()) {
      throw new Error("Customer with this vehicle number already exists");
    }
    
    const customerDocument = {
      full_name: customerData.full_name,
      mobile_number: customerData.mobile_number,
      address: customerData.address,
      vehicle_model: customerData.vehicle_model,
      nic_number: customerData.nic_number,
      birthday: customerData.birthday,
      vehicle_type: customerData.vehicle_type || 'Car',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(customerRef, customerDocument);
    
    // Return in component format
    return {
      id: vehicleId,
      fullName: customerData.full_name,
      mobileNumber: customerData.mobile_number,
      address: customerData.address,
      vehicleModel: customerData.vehicle_model,
      vehicleNumber: vehicleId,
      nicNumber: customerData.nic_number,
      birthday: customerData.birthday,
      vehicleType: customerData.vehicle_type || 'Car',
      serviceHistory: []
    };
    
  } catch (error) {
    console.error("Error registering customer:", error);
    throw new Error(`Failed to register customer: ${error.message}`);
  }
};

/**
 * Add a new service job to customer's record
 * @param {string} vehicleNumber - Vehicle number (customer document ID)
 * @param {Object} jobData - Job information with services array
 * @returns {Object} Created job data
 */
export const addServiceJob = async (vehicleNumber, jobData) => {
  try {
    const vehicleId = vehicleNumber.toUpperCase();
    
    // Verify customer exists
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleId);
    const customerSnap = await getDoc(customerRef);
    
    if (!customerSnap.exists()) {
      throw new Error("Customer not found. Please register the customer first.");
    }

    const customerData = customerSnap.data();
    
    // Create job document for both collections
    const jobDocument = {
      vehicleNumber: vehicleId,
      customerName: customerData.full_name,
      phoneNumber: customerData.mobile_number,
      vehicleType: customerData.vehicle_type || 'Car',
      services: jobData.services || [],
      lastService: jobData.services && jobData.services.length > 0 ? jobData.services[0] : 'Service',
      job_datetime: serverTimestamp(),
      created_at: serverTimestamp(),
      technician_name: jobData.technician_name || 'Not specified',
      cost: jobData.cost || 0,
      status: jobData.status || 'Completed',
      notes: jobData.notes || ''
    };
    
    // Add to main jobs collection (for dashboard)
    const mainJobsRef = collection(db, 'jobs');
    const mainJobDoc = await addDoc(mainJobsRef, jobDocument);
    
    // Also add to customer's jobs subcollection (for customer profile)
    const customerJobsRef = collection(db, CUSTOMERS_COLLECTION, vehicleId, JOBS_SUBCOLLECTION);
    await addDoc(customerJobsRef, jobDocument);
    
    console.log(`✅ Job added to both main jobs collection and customer ${vehicleId} subcollection`);
    
    return {
      id: mainJobDoc.id,
      ...jobDocument,
      jobDateTime: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error adding service job:", error);
    throw new Error(`Failed to add service job: ${error.message}`);
  }
};

/**
 * Get all customers for dashboard/admin view
 * @returns {Array} Array of all customers
 */
export const getAllCustomers = async () => {
  try {
    const customersRef = collection(db, CUSTOMERS_COLLECTION);
    const querySnapshot = await getDocs(customersRef);
    
    const customers = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      customers.push({
        id: doc.id,
        fullName: data.full_name,
        mobileNumber: data.mobile_number,
        address: data.address,
        vehicleModel: data.vehicle_model,
        vehicleNumber: doc.id,
        nicNumber: data.nic_number,
        birthday: data.birthday,
        vehicleType: data.vehicle_type || 'Car'
      });
    });
    
    return customers;
  } catch (error) {
    console.error("Error getting all customers:", error);
    throw new Error(`Failed to get customers: ${error.message}`);
  }
};

/**
 * Get all jobs across all customers for dashboard
 * @returns {Array} Array of all jobs with customer information
 */
/**
 * Get all jobs across all customers for dashboard
 * This function searches through all customer documents and their job subcollections
 * @returns {Array} Array of all jobs with customer information
 */
export const getAllJobs = async () => {
  try {
    console.log('🔄 API: Starting getAllJobs...');
    console.log('🔄 API: Database object:', db);
    
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    // First, try to get from main jobs collection (if it exists)
    console.log('🔄 API: Attempting to fetch from main jobs collection...');
    try {
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(jobsRef, orderBy("job_datetime", "desc"));
      const jobsSnap = await getDocs(jobsQuery);
      
      if (!jobsSnap.empty) {
        console.log(`✅ API: Found ${jobsSnap.size} jobs in main collection`);
        const allJobs = [];
        jobsSnap.forEach((jobDoc) => {
          const jobData = jobDoc.data();
          allJobs.push({
            id: jobDoc.id,
            vehicleNumber: jobData.vehicleNumber,
            customerName: jobData.customerName,
            phoneNumber: jobData.phoneNumber,
            vehicleType: jobData.vehicleType,
            services: jobData.services || [],
            lastService: jobData.lastService || (jobData.services && jobData.services.length > 0 ? jobData.services[0] : 'Service'),
            jobDateTime: jobData.job_datetime?.toDate ? jobData.job_datetime.toDate().toISOString() : new Date().toISOString()
          });
        });
        return allJobs;
      }
    } catch (mainCollectionError) {
      console.log('⚠️ API: Main jobs collection not found or empty, trying subcollections...');
    }
    
    // If main collection doesn't exist or is empty, get jobs from customer subcollections
    console.log('🔄 API: Fetching jobs from customer subcollections...');
    const customersRef = collection(db, CUSTOMERS_COLLECTION);
    const customersSnap = await getDocs(customersRef);
    
    console.log(`🔄 API: Found ${customersSnap.size} customers`);
    
    const allJobs = [];
    
    // Iterate through each customer
    for (const customerDoc of customersSnap.docs) {
      const customerData = customerDoc.data();
      const vehicleNumber = customerDoc.id;
      
      console.log(`🔄 API: Processing customer ${vehicleNumber}...`);
      
      // Get jobs subcollection for this customer
      const jobsRef = collection(db, CUSTOMERS_COLLECTION, vehicleNumber, JOBS_SUBCOLLECTION);
      
      try {
        const jobsQuery = query(jobsRef, orderBy("job_datetime", "desc"));
        const jobsSnap = await getDocs(jobsQuery);
        
        console.log(`🔄 API: Customer ${vehicleNumber} has ${jobsSnap.size} jobs`);
        
        jobsSnap.forEach((jobDoc) => {
          const jobData = jobDoc.data();
          allJobs.push({
            id: jobDoc.id,
            vehicleNumber: vehicleNumber,
            customerName: customerData.full_name,
            phoneNumber: customerData.mobile_number,
            vehicleType: customerData.vehicle_type || 'Car',
            services: jobData.services || [],
            lastService: jobData.services && jobData.services.length > 0 ? jobData.services[0] : 'Service',
            jobDateTime: jobData.job_datetime?.toDate ? jobData.job_datetime.toDate().toISOString() : new Date().toISOString()
          });
        });
      } catch (jobError) {
        console.log(`⚠️ API: Error fetching jobs for customer ${vehicleNumber}:`, jobError.message);
      }
    }
    
    // Sort all jobs by date
    allJobs.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime));
    
    console.log(`✅ API: Found total ${allJobs.length} jobs across all customers`);
    console.log('✅ API: Final jobs array:', allJobs);
    return allJobs;
    
  } catch (error) {
    console.error("❌ API: Error getting all jobs:", error);
    console.error("❌ API: Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Check if it's a Firebase error
    if (error.code && error.code.startsWith('firestore/')) {
      console.error("❌ API: This is a Firestore error:", error.code);
    }
    
    // Return empty array instead of throwing to prevent app crash
    console.log("⚠️ API: Returning empty array due to error");
    return [];
  }
};

/**
 * Update customer information
 * @param {string} vehicleNumber - Vehicle number (customer document ID)
 * @param {Object} updateData - Data to update
 * @returns {boolean} Success status
 */
export const updateCustomer = async (vehicleNumber, updateData) => {
  try {
    const vehicleId = vehicleNumber.toUpperCase();
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleId);
    
    await setDoc(customerRef, {
      ...updateData,
      updated_at: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error(`Failed to update customer: ${error.message}`);
  }
};

/**
 * Utility functions for data formatting
 */
export const formatDate = (date) => {
  const jsDate = date instanceof Date ? date : new Date(date);
  return jsDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (datetime) => {
  const jsDate = datetime instanceof Date ? datetime : new Date(datetime);
  return jsDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
