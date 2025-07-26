import React, { useState, useEffect } from 'react';
import CustomerCard from './CustomerCard';
import './Dashboard.css';

const Dashboard = ({ onNavigateToSearch, onCustomerSelect, loadJobs }) => {
  const [jobs, setJobs] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      console.log('🔄 Dashboard: Starting to fetch jobs...');
      setDashboardLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Dashboard: Loading timeout reached');
        setDashboardLoading(false);
        setJobs([]);
      }, 10000); // 10 second timeout
      
      try {
        const jobsData = await loadJobs();
        console.log('✅ Dashboard: Jobs loaded:', jobsData);
        setJobs(jobsData || []);
      } catch (error) {
        console.error('❌ Dashboard: Error loading jobs:', error);
        setJobs([]);
      } finally {
        clearTimeout(timeoutId);
        console.log('🏁 Dashboard: Loading complete');
        setDashboardLoading(false);
      }
    };

    fetchJobs();
  }, [loadJobs]);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (dashboardLoading) {
    return (
      <div className="dashboard loading">
        <header className="dashboard-header">
          <h1>YellowHut Dashboard</h1>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
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
          {sortedJobs.length === 0 ? (
            <div className="no-jobs card">
              <div className="no-jobs-icon">📊</div>
              <h3>No Service Records Found</h3>
              <p>Start by adding your first customer service record to see the dashboard in action.</p>
              <div className="no-jobs-actions">
                <button className="btn" onClick={onNavigateToSearch}>
                  ➕ Add First Customer
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
