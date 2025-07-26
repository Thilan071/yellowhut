import { useState, useCallback } from 'react';
import { 
  searchCustomer as apiSearchCustomer, 
  registerNewCustomer, 
  addServiceJob, 
  getAllCustomers,
  getAllJobs
} from '../firebase/yellowHutApi';

/**
 * Custom hook for customer operations in YellowHut system
 */
export const useYellowHutCustomers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Search for a customer by vehicle number
   */
  const searchCustomer = async (vehicleNumber) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await apiSearchCustomer(vehicleNumber);
      setLoading(false);
      return customer;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  /**
   * Register a new customer
   */
  const addCustomer = async (vehicleNumber, customerData) => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await registerNewCustomer(vehicleNumber, customerData);
      setLoading(false);
      return newCustomer;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all customers
   */
  const loadAllCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const customers = await getAllCustomers();
      setLoading(false);
      return customers;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  return {
    loading,
    error,
    searchCustomer,
    addCustomer,
    loadAllCustomers
  };
};

/**
 * Custom hook for job operations in YellowHut system
 */
export const useYellowHutJobs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add a new service job
   */
  const addJob = async (vehicleNumber, jobData) => {
    setLoading(true);
    setError(null);
    try {
      const newJob = await addServiceJob(vehicleNumber, jobData);
      setLoading(false);
      return newJob;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all jobs for dashboard
   */
  const loadAllJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const jobs = await getAllJobs();
      setLoading(false);
      return jobs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    addJob,
    loadAllJobs
  };
};

/**
 * Combined hook for all YellowHut operations
 */
export const useYellowHut = () => {
  const customers = useYellowHutCustomers();
  const jobs = useYellowHutJobs();

  return {
    customers,
    jobs
  };
};
