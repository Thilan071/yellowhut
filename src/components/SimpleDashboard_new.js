import React, { useState, useEffect } from 'react';
import CustomerCard from './CustomerCard';
import './Dashboard.css';

// Direct Firebase imports
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const SimpleDashboard = ({ onNavigateToSearch, onCustomerSelect }) => {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('today');

  // Filter options
  const filterOptions = [
    { key: 'today', label: '📅 Today', icon: '📅' },
    { key: 'yesterday', label: '🔄 Yesterday', icon: '🔄' },
    { key: 'thisWeek', label: '📊 This Week', icon: '📊' },
    { key: 'thisMonth', label: '📈 This Month', icon: '📈' },
    { key: 'all', label: '🗂️ All Jobs', icon: '🗂️' },
    { key: 'cars', label: '🚗 Cars Only', icon: '🚗' },
    { key: 'vans', label: '🚐 Vans/SUVs', icon: '🚐' },
    { key: 'recent', label: '⭐ Recent (7 days)', icon: '⭐' }
  ];

  // Filter functions with improved date logic
  const applyFilter = (filterKey, jobsList = allJobs) => {
    console.log(`🔍 Applying filter: ${filterKey} to ${jobsList.length} jobs`);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Start of current week (Sunday = 0, Monday = 1, etc.)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    // Start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    let filteredJobs = [];

    switch (filterKey) {
      case 'today':
        filteredJobs = jobsList.filter(job => {
          const jobDate = new Date(job.jobDateTime);
          const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
          const isToday = jobDateOnly.getTime() === today.getTime();
          return isToday;
        });
        break;
      
      case 'yesterday':
        filteredJobs = jobsList.filter(job => {
          const jobDate = new Date(job.jobDateTime);
          const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
          const isYesterday = jobDateOnly.getTime() === yesterday.getTime();
          return isYesterday;
        });
        break;
      
      case 'thisWeek':
        filteredJobs = jobsList.filter(job => {
          const jobDate = new Date(job.jobDateTime);
          const isThisWeek = jobDate >= startOfWeek && jobDate < tomorrow;
          return isThisWeek;
        });
        break;
      
      case 'thisMonth':
        filteredJobs = jobsList.filter(job => {
          const jobDate = new Date(job.jobDateTime);
          const isThisMonth = jobDate >= startOfMonth && jobDate < tomorrow;
          return isThisMonth;
        });
        break;
      
      case 'recent':
        filteredJobs = jobsList.filter(job => {
          const jobDate = new Date(job.jobDateTime);
          const isRecent = jobDate >= sevenDaysAgo && jobDate < tomorrow;
          return isRecent;
        });
        break;
      
      case 'cars':
        filteredJobs = jobsList.filter(job => {
          const isCar = job.vehicleType && job.vehicleType.toLowerCase().includes('car');
          return isCar;
        });
        break;
      
      case 'vans':
        filteredJobs = jobsList.filter(job => {
          const isVanSUV = job.vehicleType && (
            job.vehicleType.toLowerCase().includes('van') ||
            job.vehicleType.toLowerCase().includes('suv') ||
            job.vehicleType.toLowerCase().includes('pickup')
          );
          return isVanSUV;
        });
        break;
      
      case 'all':
      default:
        filteredJobs = [...jobsList];
        break;
    }

    // Sort by most recent first
    filteredJobs.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime));
    return filteredJobs;
  };

  // Handle filter change
  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
    const filtered = applyFilter(filterKey, allJobs);
    setJobs(filtered);
  };

  // Simple function to fetch jobs directly from Firebase
  const fetchJobsFromFirebase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get jobs from main 'jobs' collection
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      
      const jobsList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Better date handling - try multiple date fields and formats
        let jobDateTime = new Date(); // default to today if no date found
        
        if (data.job_datetime?.toDate) {
          jobDateTime = data.job_datetime.toDate();
        } else if (data.job_datetime) {
          jobDateTime = new Date(data.job_datetime);
        } else if (data.createdAt?.toDate) {
          jobDateTime = data.createdAt.toDate();
        } else if (data.createdAt) {
          jobDateTime = new Date(data.createdAt);
        } else if (data.date) {
          jobDateTime = new Date(data.date);
        }
        
        // Ensure we have a valid date
        if (isNaN(jobDateTime.getTime())) {
          jobDateTime = new Date();
        }
        
        jobsList.push({
          id: doc.id,
          vehicleNumber: data.vehicleNumber || 'Unknown',
          customerName: data.customerName || 'Unknown Customer',
          phoneNumber: data.phoneNumber || data.mobile_number || 'No Phone',
          vehicleType: data.vehicleType || data.vehicle_type || 'Car',
          services: data.services || ['Service'],
          lastService: data.lastService || (data.services && data.services[0]) || 'Service',
          jobDateTime: jobDateTime.toISOString()
        });
      });
      
      setAllJobs(jobsList); // Store all jobs
      
      // Apply default filter (today's jobs)
      const filteredJobs = applyFilter(activeFilter, jobsList);
      setJobs(filteredJobs);
      
      // If no jobs found at all, try alternative method
      if (jobsList.length === 0) {
        await fetchFromCustomersCollection();
      }
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(`Error fetching jobs: ${error.message}`);
      await fetchFromCustomersCollection();
    } finally {
      setLoading(false);
    }
  };

  // Alternative method: fetch from customers subcollections
  const fetchFromCustomersCollection = async () => {
    try {
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
            
            // Better date handling for customer jobs
            let jobDateTime = new Date(); // default to today
            
            if (jobData.job_datetime?.toDate) {
              jobDateTime = jobData.job_datetime.toDate();
            } else if (jobData.job_datetime) {
              jobDateTime = new Date(jobData.job_datetime);
            } else if (jobData.createdAt?.toDate) {
              jobDateTime = jobData.createdAt.toDate();
            } else if (jobData.createdAt) {
              jobDateTime = new Date(jobData.createdAt);
            } else if (jobData.date) {
              jobDateTime = new Date(jobData.date);
            }
            
            // Ensure valid date
            if (isNaN(jobDateTime.getTime())) {
              jobDateTime = new Date();
            }
            
            allJobs.push({
              id: jobDoc.id,
              vehicleNumber: customerDoc.id,
              customerName: customerData.full_name || 'Unknown Customer',
              phoneNumber: customerData.mobile_number || 'No Phone',
              vehicleType: customerData.vehicle_type || 'Car',
              services: jobData.services || ['Service'],
              lastService: jobData.services && jobData.services[0] || 'Service',
              jobDateTime: jobDateTime.toISOString()
            });
          });
        } catch (subError) {
          console.log(`Error with customer ${customerDoc.id}:`, subError.message);
        }
      }
      
      allJobs.sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime));
      setAllJobs(allJobs);
      
      // Apply default filter (today's jobs)
      const filteredJobs = applyFilter(activeFilter, allJobs);
      setJobs(filteredJobs);
      
    } catch (error) {
      console.error('Error fetching from customers:', error);
      setError(`Error fetching from customers: ${error.message}`);
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

        {/* Filter Section */}
        <div className="filter-section" style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h3 style={{ 
              margin: 0, 
              color: '#333',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              📋 Filter Jobs:
            </h3>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              background: '#f8f9fa',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              Today: {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} | Current Time: {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              flex: 1
            }}>
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleFilterChange(option.key)}
                  style={{
                    padding: '8px 12px',
                    border: activeFilter === option.key ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '20px',
                    background: activeFilter === option.key ? '#007bff' : 'white',
                    color: activeFilter === option.key ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: activeFilter === option.key ? '600' : '400',
                    transition: 'all 0.3s ease',
                    minWidth: 'fit-content',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== option.key) {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.borderColor = '#007bff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== option.key) {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#ddd';
                    }
                  }}
                >
                  {option.icon} {option.label.replace(/^[📅🔄📊📈🗂️🚗🚐⭐]\s/, '')}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '14px',
            color: '#666'
          }}>
            <div>
              <strong>Showing:</strong> {jobs.length} of {allJobs.length} total jobs
              {activeFilter !== 'all' && (
                <span style={{ color: '#007bff', marginLeft: '5px' }}>
                  (Filtered by: {filterOptions.find(f => f.key === activeFilter)?.label})
                </span>
              )}
            </div>
            <button 
              className="btn" 
              onClick={fetchJobsFromFirebase}
              style={{ 
                backgroundColor: '#28a745',
                padding: '6px 12px',
                fontSize: '12px'
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
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
              <div className="no-jobs-icon">
                {allJobs.length === 0 ? '📋' : '🔍'}
              </div>
              
              {allJobs.length === 0 ? (
                <>
                  <h3>No Service Records in Database</h3>
                  <p>Your YellowHut database is currently empty. Start by adding customers and their service records to see data here.</p>
                  <div className="no-jobs-actions" style={{ marginTop: '20px' }}>
                    <button className="btn" onClick={onNavigateToSearch}>
                      ➕ Add Your First Customer
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>No {filterOptions.find(f => f.key === activeFilter)?.label?.replace(/^[📅🔄📊📈🗂️🚗🚐⭐]\s/, '') || 'Jobs'} Found</h3>
                  <p>
                    No service records match the <strong>{filterOptions.find(f => f.key === activeFilter)?.label?.replace(/^[📅🔄📊📈🗂️🚗🚐⭐]\s/, '') || 'selected'}</strong> filter.
                    {activeFilter === 'today' && ' There are no jobs scheduled for today.'}
                    {activeFilter === 'yesterday' && ' There were no jobs completed yesterday.'}
                    {activeFilter === 'thisWeek' && ' No jobs found for this week.'}
                    {activeFilter === 'thisMonth' && ' No jobs found for this month.'}
                    {(activeFilter === 'cars' || activeFilter === 'vans') && ' No jobs found for this vehicle type.'}
                    {activeFilter === 'recent' && ' No jobs found in the last 7 days.'}
                  </p>
                  <div className="filter-suggestions" style={{
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '15px',
                    border: '1px solid #e9ecef'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>
                      <strong>💡 Try these options:</strong>
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <button 
                        className="btn" 
                        onClick={() => handleFilterChange('all')}
                        style={{ 
                          backgroundColor: '#17a2b8',
                          padding: '8px 16px',
                          fontSize: '13px'
                        }}
                      >
                        🗂️ View All Jobs
                      </button>
                      {activeFilter !== 'recent' && (
                        <button 
                          className="btn" 
                          onClick={() => handleFilterChange('recent')}
                          style={{ 
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            padding: '8px 16px',
                            fontSize: '13px'
                          }}
                        >
                          ⭐ Recent Jobs
                        </button>
                      )}
                      {activeFilter !== 'thisMonth' && (
                        <button 
                          className="btn" 
                          onClick={() => handleFilterChange('thisMonth')}
                          style={{ 
                            backgroundColor: '#6f42c1',
                            color: 'white',
                            padding: '8px 16px',
                            fontSize: '13px'
                          }}
                        >
                          📈 This Month
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
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
                  <span className="count-label">
                    {activeFilter === 'today' ? "Today's Jobs:" : 
                     activeFilter === 'all' ? "Total Jobs:" :
                     `${filterOptions.find(f => f.key === activeFilter)?.label || 'Filtered'} Jobs:`}
                  </span>
                  <span className="count-number">{jobs.length}</span>
                  {activeFilter !== 'all' && allJobs.length > jobs.length && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      marginLeft: '10px' 
                    }}>
                      (of {allJobs.length} total)
                    </span>
                  )}
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
