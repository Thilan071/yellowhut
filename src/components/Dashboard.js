import React from 'react';
import CustomerCard from './CustomerCard';
import LoadingSpinner from './LoadingSpinner';
import './Dashboard.css';

const Dashboard = ({ jobs, loading, onNavigateToSearch, onCustomerSelect }) => {
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
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
              <p>Start by adding your first customer service record.</p>
              <button className="btn" onClick={onNavigateToSearch}>
                ➕ Add First Customer
              </button>
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
