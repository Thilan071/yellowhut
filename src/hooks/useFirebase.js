import { useState, useEffect } from 'react';
import { customerService, jobService } from '../firebase/services';

// Custom hook for customer operations
export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCustomer = async (vehicleNumber) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await customerService.getCustomerByVehicleNumber(vehicleNumber);
      setLoading(false);
      return customer;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const addCustomer = async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await customerService.addCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      setLoading(false);
      return newCustomer;
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
      const allCustomers = await customerService.getAllCustomers();
      setCustomers(allCustomers);
      setLoading(false);
      return allCustomers;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  return {
    customers,
    loading,
    error,
    searchCustomer,
    addCustomer,
    loadAllCustomers
  };
};

// Custom hook for job operations
export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addJob = async (jobData) => {
    setLoading(true);
    setError(null);
    try {
      const newJob = await jobService.addJob(jobData);
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
      const allJobs = await jobService.getAllJobsWithCustomers();
      setJobs(allJobs);
      setLoading(false);
      return allJobs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  const loadCustomerJobs = async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const customerJobs = await jobService.getJobsByCustomer(customerId);
      setLoading(false);
      return customerJobs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  return {
    jobs,
    loading,
    error,
    addJob,
    loadAllJobs,
    loadCustomerJobs
  };
};

// Combined hook for Firebase operations
export const useFirebase = () => {
  const customers = useCustomers();
  const jobs = useJobs();

  return {
    customers,
    jobs
  };
};
