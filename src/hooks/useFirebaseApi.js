import { useState } from 'react';
import { 
  getCustomer, 
  registerCustomer, 
  addJob, 
  getJobHistory, 
  getAllCustomers,
  getAllJobs,
  updateCustomer 
} from '../firebase/firebaseApi';

/**
 * Custom hook for customer-related operations using the new Firebase API
 */
export const useCustomerApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCustomer = async (vehicleNumber) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await getCustomer(vehicleNumber.toUpperCase());
      setLoading(false);
      return customer;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const addCustomer = async (vehicleNumber, customerData) => {
    setLoading(true);
    setError(null);
    try {
      // Transform the data to match the Firebase API structure
      const apiCustomerData = {
        full_name: customerData.fullName,
        mobile_number: customerData.mobileNumber,
        address: customerData.address,
        vehicle_model: customerData.vehicleModel,
        nic_number: customerData.nicNumber,
        birthday: customerData.birthday,
        vehicle_type: customerData.vehicleType
      };
      
      const newCustomer = await registerCustomer(vehicleNumber.toUpperCase(), apiCustomerData);
      setLoading(false);
      
      // Transform back to component format
      return {
        id: newCustomer.vehicleNumber,
        fullName: newCustomer.full_name,
        mobileNumber: newCustomer.mobile_number,
        address: newCustomer.address,
        vehicleModel: newCustomer.vehicle_model,
        vehicleNumber: newCustomer.vehicleNumber,
        nicNumber: newCustomer.nic_number,
        birthday: newCustomer.birthday,
        vehicleType: newCustomer.vehicle_type,
        serviceHistory: []
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const loadAllCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const customers = await getAllCustomers();
      const transformedCustomers = customers.map(customer => ({
        id: customer.vehicleNumber,
        fullName: customer.full_name,
        mobileNumber: customer.mobile_number,
        address: customer.address,
        vehicleModel: customer.vehicle_model,
        vehicleNumber: customer.vehicleNumber,
        nicNumber: customer.nic_number,
        birthday: customer.birthday,
        vehicleType: customer.vehicle_type || 'Car'
      }));
      setLoading(false);
      return transformedCustomers;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  const getCustomerWithHistory = async (vehicleNumber) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await getCustomer(vehicleNumber.toUpperCase());
      if (!customer) {
        setLoading(false);
        return null;
      }

      const jobHistory = await getJobHistory(vehicleNumber.toUpperCase());
      
      // Transform to component format
      const transformedCustomer = {
        id: customer.vehicleNumber,
        fullName: customer.full_name,
        mobileNumber: customer.mobile_number,
        address: customer.address,
        vehicleModel: customer.vehicle_model,
        vehicleNumber: customer.vehicleNumber,
        nicNumber: customer.nic_number,
        birthday: customer.birthday,
        vehicleType: customer.vehicle_type || 'Car',
        serviceHistory: jobHistory.map(job => ({
          id: job.id,
          jobDateTime: job.job_datetime?.toDate ? job.job_datetime.toDate().toISOString() : new Date().toISOString(),
          services: job.services || []
        }))
      };

      setLoading(false);
      return transformedCustomer;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    error,
    searchCustomer: getCustomerWithHistory,
    addCustomer,
    loadAllCustomers
  };
};

/**
 * Custom hook for job-related operations using the new Firebase API
 */
export const useJobApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addNewJob = async (vehicleNumber, jobData) => {
    setLoading(true);
    setError(null);
    try {
      // Transform jobData to API format
      const apiJobData = {
        services: jobData.services,
        job_datetime: new Date() // Use current timestamp
      };
      
      const newJob = await addJob(vehicleNumber.toUpperCase(), apiJobData);
      setLoading(false);
      return newJob;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const loadAllJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobs = await getAllJobs();
      const transformedJobs = jobs.map(job => ({
        id: job.id,
        vehicleNumber: job.vehicleNumber,
        customerName: job.customerName,
        phoneNumber: job.phoneNumber,
        vehicleType: job.vehicleType,
        services: job.services || [],
        lastService: job.services && job.services.length > 0 ? job.services[0] : 'Service',
        jobDateTime: job.job_datetime?.toDate ? job.job_datetime.toDate().toISOString() : new Date().toISOString()
      }));
      setLoading(false);
      return transformedJobs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  const loadCustomerJobs = async (vehicleNumber) => {
    setLoading(true);
    setError(null);
    try {
      const jobs = await getJobHistory(vehicleNumber.toUpperCase());
      const transformedJobs = jobs.map(job => ({
        id: job.id,
        jobDateTime: job.job_datetime?.toDate ? job.job_datetime.toDate().toISOString() : new Date().toISOString(),
        services: job.services || []
      }));
      setLoading(false);
      return transformedJobs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  return {
    loading,
    error,
    addJob: addNewJob,
    loadAllJobs,
    loadCustomerJobs
  };
};

/**
 * Combined hook for all Firebase API operations
 */
export const useFirebaseApi = () => {
  const customers = useCustomerApi();
  const jobs = useJobApi();

  return {
    customers,
    jobs
  };
};
