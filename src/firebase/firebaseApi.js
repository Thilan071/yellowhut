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
 * Firestore API Module for YellowHut Vehicle Service Application
 * 
 * Data Structure:
 * - Root collection: 'customers'
 * - Document ID: vehicle_number (unique)
 * - Subcollection: 'jobs' (for each customer's service history)
 */

// Collection names
const CUSTOMERS_COLLECTION = "customers";
const JOBS_SUBCOLLECTION = "jobs";

/**
 * Get customer data by vehicle number
 * @param {string} vehicleNumber - The vehicle number (used as document ID)
 * @returns {Object|null} Customer data object or null if not found
 */
export const getCustomer = async (vehicleNumber) => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleNumber);
    const customerSnap = await getDoc(customerRef);
    
    if (customerSnap.exists()) {
      return {
        vehicleNumber: customerSnap.id,
        ...customerSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting customer:", error);
    throw new Error(`Failed to get customer: ${error.message}`);
  }
};

/**
 * Register a new customer
 * @param {string} vehicleNumber - The vehicle number (used as document ID)
 * @param {Object} customerData - Customer information object
 * @param {string} customerData.full_name - Customer's full name
 * @param {string} customerData.mobile_number - Customer's mobile number
 * @param {string} customerData.address - Customer's address
 * @param {string} customerData.vehicle_model - Vehicle model
 * @param {string} customerData.nic_number - National ID number
 * @param {string} customerData.birthday - Customer's birthday
 * @param {string} customerData.vehicle_type - Vehicle type (Car, Van, SUV, Pickup)
 * @returns {Object} Created customer data
 */
export const registerCustomer = async (vehicleNumber, customerData) => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleNumber);
    
    const customerDocument = {
      ...customerData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(customerRef, customerDocument);
    
    return {
      vehicleNumber,
      ...customerDocument
    };
  } catch (error) {
    console.error("Error registering customer:", error);
    throw new Error(`Failed to register customer: ${error.message}`);
  }
};

/**
 * Add a new service job for a customer
 * @param {string} vehicleNumber - The vehicle number (customer document ID)
 * @param {Object} jobData - Job information object
 * @param {Timestamp} jobData.job_datetime - When the job was performed
 * @param {string[]} jobData.services - Array of services performed
 * @returns {Object} Created job data with generated ID
 */
export const addJob = async (vehicleNumber, jobData) => {
  try {
    const jobsRef = collection(db, CUSTOMERS_COLLECTION, vehicleNumber, JOBS_SUBCOLLECTION);
    
    const jobDocument = {
      ...jobData,
      job_datetime: jobData.job_datetime || serverTimestamp(),
      created_at: serverTimestamp()
    };
    
    const docRef = await addDoc(jobsRef, jobDocument);
    
    return {
      id: docRef.id,
      ...jobDocument
    };
  } catch (error) {
    console.error("Error adding job:", error);
    throw new Error(`Failed to add job: ${error.message}`);
  }
};

/**
 * Get job history for a customer
 * @param {string} vehicleNumber - The vehicle number (customer document ID)
 * @returns {Array} Array of job data objects ordered by job_datetime (newest first)
 */
export const getJobHistory = async (vehicleNumber) => {
  try {
    const jobsRef = collection(db, CUSTOMERS_COLLECTION, vehicleNumber, JOBS_SUBCOLLECTION);
    const q = query(jobsRef, orderBy("job_datetime", "desc"));
    const querySnapshot = await getDocs(q);
    
    const jobs = [];
    querySnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return jobs;
  } catch (error) {
    console.error("Error getting job history:", error);
    throw new Error(`Failed to get job history: ${error.message}`);
  }
};

/**
 * Get all customers (for dashboard/admin purposes)
 * @returns {Array} Array of all customer data objects
 */
export const getAllCustomers = async () => {
  try {
    const customersRef = collection(db, CUSTOMERS_COLLECTION);
    const querySnapshot = await getDocs(customersRef);
    
    const customers = [];
    querySnapshot.forEach((doc) => {
      customers.push({
        vehicleNumber: doc.id,
        ...doc.data()
      });
    });
    
    return customers;
  } catch (error) {
    console.error("Error getting all customers:", error);
    throw new Error(`Failed to get all customers: ${error.message}`);
  }
};

/**
 * Get all jobs across all customers (for dashboard purposes)
 * @returns {Array} Array of job data objects with customer vehicle numbers
 */
export const getAllJobs = async () => {
  try {
    const customers = await getAllCustomers();
    const allJobs = [];
    
    for (const customer of customers) {
      const jobs = await getJobHistory(customer.vehicleNumber);
      const jobsWithCustomerInfo = jobs.map(job => ({
        ...job,
        vehicleNumber: customer.vehicleNumber,
        customerName: customer.full_name,
        phoneNumber: customer.mobile_number,
        vehicleType: customer.vehicle_type || 'Car'
      }));
      allJobs.push(...jobsWithCustomerInfo);
    }
    
    // Sort all jobs by job_datetime (newest first)
    return allJobs.sort((a, b) => {
      const dateA = a.job_datetime?.toDate ? a.job_datetime.toDate() : new Date(a.job_datetime);
      const dateB = b.job_datetime?.toDate ? b.job_datetime.toDate() : new Date(b.job_datetime);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting all jobs:", error);
    throw new Error(`Failed to get all jobs: ${error.message}`);
  }
};

/**
 * Update customer information
 * @param {string} vehicleNumber - The vehicle number (customer document ID)
 * @param {Object} updateData - Data to update
 * @returns {boolean} Success status
 */
export const updateCustomer = async (vehicleNumber, updateData) => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, vehicleNumber);
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
 * Utility function to convert Firestore timestamp to JavaScript Date
 * @param {Timestamp} timestamp - Firestore timestamp
 * @returns {Date} JavaScript Date object
 */
export const timestampToDate = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * Utility function to format date for display
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const jsDate = date?.toDate ? date.toDate() : new Date(date);
  return jsDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Utility function to format datetime for display
 * @param {Date|Timestamp} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  const jsDate = datetime?.toDate ? datetime.toDate() : new Date(datetime);
  return jsDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
