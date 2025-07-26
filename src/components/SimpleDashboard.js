import React, { useState, useEffect } from 'react';
import CustomerCard from './CustomerCard';
import './Dashboard.css';

// Direct Firebase imports
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SimpleDashboard = ({ onNavigateToSearch, onCustomerSelect }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple function to fetch jobs directly from Firebase
  const fetchJobsFromFirebase = async () => {
    console.log('🔄 SimpleDashboard: Fetching jobs directly from Firebase...');
    setLoading(true);
    setError(null);
    
    try {
      // Try to get jobs from main 'jobs' collection
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      
      const jobsList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        jobsList.push({
          id: doc.id,
          vehicleNumber: data.vehicleNumber || 'Unknown',
          customerName: data.customerName || 'Unknown Customer',
          phoneNumber: data.phoneNumber || data.mobile_number || 'No Phone',
          vehicleType: data.vehicleType || data.vehicle_type || 'Car',
          services: data.services || ['Service'],
          lastService: data.lastService || (data.services && data.services[0]) || 'Service',
          jobDateTime: data.job_datetime?.toDate ? data.job_datetime.toDate().toISOString() : new Date().toISOString()
        });
      });
      
      console.log(`✅ SimpleDashboard: Found ${jobsList.length} jobs`);
      setJobs(jobsList);
      
      if (jobsList.length === 0) {
        console.log('ℹ️ SimpleDashboard: No jobs found, trying customers collection...');
        await fetchFromCustomersCollection();
      }
      
    } catch (error) {
      console.error('❌ SimpleDashboard: Error fetching jobs:', error);
      setError(`Error fetching jobs: ${error.message}`);
      
      // Try alternative method
      await fetchFromCustomersCollection();
    } finally {
      setLoading(false);
    }
  };

  // Alternative method: fetch from customers subcollections
  const fetchFromCustomersCollection = async () => {
    try {
      console.log('🔄 SimpleDashboard: Trying customers collection...');
      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      
      const allJobs = [];
      
      for (const customerDoc of customersSnapshot.docs) {
        const customerData = customerDoc.data();
        
        try {
          const jobsRef = collection(db, 'customers', customerDoc.id, 'jobs');
          const jobsSnapshot = await getDocs(jobsRef);
          
          jobsSnapshot.forEach((jobDoc) => {
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
          console.log(`⚠️ SimpleDashboard: Error with customer ${customerDoc.id}:`, subError.message);
        }
      }
      
      allJobs.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime));
      console.log(`✅ SimpleDashboard: Found ${allJobs.length} jobs from customers`);
      setJobs(allJobs);
      
    } catch (error) {
      console.error('❌ SimpleDashboard: Error fetching from customers:', error);
      setError(`Error fetching from customers: ${error.message}`);
    }
  };

  // Add sample data directly
  const addSampleData = async () => {
    try {
      console.log('🔄 SimpleDashboard: Adding sample data...');
      
      // Sample data
      const sampleCustomer = {
        full_name: 'John Silva',
        mobile_number: '077-123-4567',
        address: 'No. 123, Galle Road, Colombo 03',
        vehicle_model: 'Toyota Prius',
        nic_number: '199012345678',
        birthday: '1990-01-15',
        vehicle_type: 'Car',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const sampleJob = {
        services: ['Oil Change', 'Filter Replacement'],
        job_datetime: serverTimestamp(),
        created_at: serverTimestamp(),
        technician_name: 'Sunil Perera',
        cost: 3500,
        status: 'Completed',
        notes: 'Regular maintenance service'
      };

      // Add customer
      const customerRef = doc(db, 'customers', 'ABC-1234');
      await setDoc(customerRef, sampleCustomer);

      // Add job to main collection
      const jobsRef = collection(db, 'jobs');
      await addDoc(jobsRef, {
        ...sampleJob,
        vehicleNumber: 'ABC-1234',
        customerName: sampleCustomer.full_name,
        phoneNumber: sampleCustomer.mobile_number,
        vehicleType: sampleCustomer.vehicle_type
      });

      // Add job to customer subcollection
      const customerJobsRef = collection(db, 'customers', 'ABC-1234', 'jobs');
      await addDoc(customerJobsRef, sampleJob);

      console.log('✅ SimpleDashboard: Sample data added');
      
      // Refresh data
      await fetchJobsFromFirebase();
      
    } catch (error) {
      console.error('❌ SimpleDashboard: Error adding sample data:', error);
      setError(`Error adding sample data: ${error.message}`);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchJobsFromFirebase();
  }, []);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">YellowHut Dashboard</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <p>Loading jobs from Firebase...</p>
            <button 
              className="btn" 
              onClick={() => setLoading(false)}
              style={{ marginTop: '20px', backgroundColor: '#ff6b6b' }}
            >
              ⏹️ Stop Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">YellowHut Dashboard</h1>
          <button 
            className="add-customer-btn"
            onClick={onNavigateToSearch}
            title="Add New Customer"
          >
            ➕
          </button>
        </div>

        <div className="dashboard-content">
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#ffe6e6', 
              borderRadius: '5px',
              border: '1px solid #ffcccc'
            }}>
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}
          
          {jobs.length === 0 ? (
            <div className="no-jobs card">
              <div className="no-jobs-icon">📊</div>
              <h3>No Service Records Found</h3>
              <p>Your Firebase database appears to be empty. Add some sample data to get started.</p>
              
              <div className="no-jobs-actions" style={{ marginTop: '20px' }}>
                <button className="btn" onClick={onNavigateToSearch}>
                  ➕ Add First Customer
                </button>
                <button 
                  className="btn" 
                  onClick={addSampleData}
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: '#4CAF50' 
                  }}
                >
                  🧪 Add Sample Data
                </button>
                <button 
                  className="btn" 
                  onClick={fetchJobsFromFirebase}
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: '#2196F3' 
                  }}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button 
                  className="btn" 
                  onClick={fetchJobsFromFirebase}
                  style={{ backgroundColor: '#2196F3' }}
                >
                  🔄 Refresh Data
                </button>
                <button 
                  className="btn" 
                  onClick={addSampleData}
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: '#4CAF50' 
                  }}
                >
                  🧪 Add More Sample Data
                </button>
              </div>
              
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <CustomerCard
                    key={job.id}
                    vehicleNumber={job.vehicleNumber}
                    customerName={job.customerName}
                    serviceType={job.lastService}
                    phoneNumber={job.phoneNumber}
                    vehicleType={job.vehicleType}
                    serviceDate={formatDateTime(job.jobDateTime)}
                    onClick={() => onCustomerSelect(job.vehicleNumber)}
                  />
                ))}
              </div>
              
              <div className="dashboard-footer">
                <div className="total-count">
                  <span className="count-label">Total Jobs:</span>
                  <span className="count-number">{jobs.length}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
