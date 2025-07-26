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
    
    // Get service history from jobs subcollection
    const jobsRef = collection(db, CUSTOMERS_COLLECTION, vehicleId, JOBS_SUBCOLLECTION);
    const jobsQuery = query(jobsRef, orderBy("job_datetime", "desc"));
    const jobsSnap = await getDocs(jobsQuery);
    
    const serviceHistory = [];
    jobsSnap.forEach((jobDoc) => {
      const jobData = jobDoc.data();
      serviceHistory.push({
        id: jobDoc.id,
        jobDateTime: jobData.job_datetime?.toDate ? jobData.job_datetime.toDate().toISOString() : new Date().toISOString(),
        services: jobData.services || []
      });
    });
    
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
export const getAllJobs = async () => {
  try {
    console.log('🔄 API: Fetching all jobs from main jobs collection...');
    
    // Fetch directly from the main jobs collection
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, orderBy("job_datetime", "desc"));
    const jobsSnap = await getDocs(jobsQuery);
    
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
    
    console.log(`✅ API: Found ${allJobs.length} jobs in main collection`);
    return allJobs;
    
  } catch (error) {
    console.error("❌ API: Error getting all jobs:", error);
    throw new Error(`Failed to get all jobs: ${error.message}`);
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
