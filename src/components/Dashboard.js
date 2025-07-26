import React, { useState, useEffect } from 'react';
import CustomerCard from './CustomerCard';
import './Dashboard.css';
import { addTestData } from '../utils/addTestData';
import { testFirebaseConnection } from '../utils/testFirebase';
import { directGetAllJobs, directAddSampleData } from '../utils/directFirebase';

const Dashboard = ({ onNavigateToSearch, onCustomerSelect, loadJobs }) => {
  const [jobs, setJobs] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingTestData, setAddingTestData] = useState(false);
  const [forceShowNoData, setForceShowNoData] = useState(false);
  const [testingFirebase, setTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      console.log('🔄 Dashboard: Starting to fetch jobs...');
      setDashboardLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Dashboard: Loading timeout reached');
        setError('Loading took too long. This usually means the database is empty or there\'s a connection issue.');
        setDashboardLoading(false);
        setJobs([]);
        setForceShowNoData(true);
      }, 5000); // 5 second timeout
      
      try {
        console.log('🔄 Dashboard: Calling loadJobs function...');
        const jobsData = await loadJobs();
        console.log('✅ Dashboard: Jobs loaded successfully:', {
          data: jobsData,
          length: jobsData ? jobsData.length : 'null/undefined',
          type: typeof jobsData
        });
        
        // Ensure we have an array
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsArray);
        
        console.log('📊 Dashboard: Final jobs state set:', jobsArray.length, 'jobs');
        
      } catch (error) {
        console.error('❌ Dashboard: Error loading jobs:', {
          message: error.message,
          stack: error.stack,
          error: error
        });
        setError(`Failed to load jobs: ${error.message}`);
        setJobs([]);
      } finally {
        clearTimeout(timeoutId);
        console.log('🏁 Dashboard: Loading complete');
        setDashboardLoading(false);
      }
    };

    if (loadJobs) {
      fetchJobs();
    } else {
      console.error('❌ Dashboard: loadJobs function is not provided');
      setDashboardLoading(false);
    }
  }, [loadJobs]);

  const handleDirectLoad = async () => {
    setDashboardLoading(true);
    setError(null);
    setForceShowNoData(false);
    
    try {
      console.log('🔄 Dashboard: Using direct Firebase load...');
      const jobsData = await directGetAllJobs();
      setJobs(jobsData || []);
      setFirebaseTestResult(`Direct load successful! Found ${jobsData.length} jobs.`);
    } catch (error) {
      console.error('❌ Dashboard: Direct load failed:', error);
      setError(`Direct load failed: ${error.message}`);
      setJobs([]);
      setForceShowNoData(true);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleDirectAddData = async () => {
    setAddingTestData(true);
    try {
      const success = await directAddSampleData();
      if (success) {
        setFirebaseTestResult('Sample data added successfully!');
        // Reload using direct method
        await handleDirectLoad();
      } else {
        setFirebaseTestResult('Failed to add sample data.');
      }
    } catch (error) {
      setFirebaseTestResult(`Error adding data: ${error.message}`);
    } finally {
      setAddingTestData(false);
    }
  };

  const handleTestFirebase = async () => {
    setTestingFirebase(true);
    try {
      const result = await testFirebaseConnection();
      setFirebaseTestResult(result.message);
      if (result.success && result.data.customers.count > 0) {
        // If there are customers, try to reload jobs
        setDashboardLoading(true);
        setForceShowNoData(false);
        const jobsData = await loadJobs();
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsArray);
        setDashboardLoading(false);
      }
    } catch (error) {
      setFirebaseTestResult(`Test failed: ${error.message}`);
    } finally {
      setTestingFirebase(false);
    }
  };

  const handleAddTestData = async () => {
    setAddingTestData(true);
    try {
      const success = await addTestData();
      if (success) {
        // Reload jobs after adding test data
        const fetchJobs = async () => {
          try {
            const jobsData = await loadJobs();
            const jobsArray = Array.isArray(jobsData) ? jobsData : [];
            setJobs(jobsArray);
            setError(null);
          } catch (error) {
            console.error('Error reloading jobs:', error);
            setError(`Failed to reload jobs: ${error.message}`);
          }
        };
        await fetchJobs();
      }
    } catch (error) {
      console.error('Error adding test data:', error);
      setError(`Failed to add test data: ${error.message}`);
    } finally {
      setAddingTestData(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (dashboardLoading && !forceShowNoData) {
    return (
      <div className="dashboard loading">
        <header className="dashboard-header">
          <h1>YellowHut Dashboard</h1>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
          <button 
            className="btn" 
            onClick={() => {
              setDashboardLoading(false);
              setForceShowNoData(true);
              setError('Loading stopped by user. Database might be empty.');
            }}
            style={{ 
              marginTop: '20px', 
              backgroundColor: '#ff6b6b' 
            }}
          >
            ⏹️ Stop Loading & Show Options
          </button>
          <button 
            className="btn" 
            onClick={handleDirectLoad}
            style={{ 
              marginTop: '10px', 
              marginLeft: '10px',
              backgroundColor: '#2196F3' 
            }}
          >
            🚀 Direct Load (Bypass Issues)
          </button>
          {error && (
            <div style={{ color: 'red', marginTop: '10px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const sortedJobs = jobs ? jobs.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime)) : [];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">All YellowHut Customer Data</h1>
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
          
          {sortedJobs.length === 0 ? (
            <div className="no-jobs card">
              <div className="no-jobs-icon">📊</div>
              <h3>No Service Records Found</h3>
              <p>Start by adding your first customer service record to see the dashboard in action.</p>
              
              {firebaseTestResult && (
                <div style={{ 
                  margin: '15px 0', 
                  padding: '10px', 
                  backgroundColor: '#f0f8ff', 
                  border: '1px solid #cce7ff',
                  borderRadius: '5px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  <strong>Firebase Test Result:</strong>
                  {firebaseTestResult}
                </div>
              )}
              
              <div className="no-jobs-actions">
                <button className="btn" onClick={onNavigateToSearch}>
                  ➕ Add First Customer
                </button>
                <button 
                  className="btn" 
                  onClick={handleDirectLoad}
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: '#2196F3'
                  }}
                >
                  🚀 Direct Load
                </button>
                <button 
                  className="btn" 
                  onClick={handleTestFirebase}
                  disabled={testingFirebase}
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: '#FF9800',
                    opacity: testingFirebase ? 0.6 : 1 
                  }}
                >
                  {testingFirebase ? '⏳ Testing...' : '🔍 Test Firebase'}
                </button>
                <button 
                  className="btn" 
                  onClick={handleDirectAddData}
                  disabled={addingTestData}
                  style={{ 
                    marginLeft: '10px', 
                    backgroundColor: '#4CAF50',
                    opacity: addingTestData ? 0.6 : 1 
                  }}
                >
                  {addingTestData ? '⏳ Adding...' : '🧪 Add Test Data'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {sortedJobs.map((job) => (
                  <CustomerCard
                    key={job.id}
                    vehicleNumber={job.vehicleNumber}
                    customerName={job.customerName}
                    serviceType={job.services ? job.services[0] : job.lastService}
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
                  <span className="count-number">{sortedJobs.length}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
