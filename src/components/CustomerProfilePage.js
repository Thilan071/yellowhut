import React from 'react';
import './CustomerProfilePage.css';

const CustomerProfilePage = ({ customer, onAddJob, onBack }) => {
  if (!customer) {
    return <div>Loading...</div>;
  }

  // Debug logging
  console.log('🔍 CustomerProfilePage - Customer data:', customer);
  console.log('📋 CustomerProfilePage - Service history:', customer.serviceHistory);
  console.log('📊 CustomerProfilePage - Service history length:', customer.serviceHistory?.length || 0);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="customer-profile-page">
      <div className="container">
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <h1>Customer Profile</h1>
        </div>

        <div className="profile-content">
          {/* Customer Details Card */}
          <div className="customer-details card">
            <div className="customer-header">
              <div className="customer-avatar">
                <span className="avatar-text">
                  {customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="customer-info">
                <h2 className="customer-name">{customer.fullName}</h2>
                <p className="customer-phone">{customer.mobileNumber}</p>
                <div className="vehicle-badge">
                  <span className="vehicle-number">{customer.vehicleNumber}</span>
                  <span className="vehicle-type">{customer.vehicleType}</span>
                </div>
              </div>
              <button className="btn add-job-btn" onClick={onAddJob}>
                ➕ Add Job
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label>Address</label>
                <span>{customer.address}</span>
              </div>
              <div className="detail-item">
                <label>Vehicle Model</label>
                <span>{customer.vehicleModel}</span>
              </div>
              <div className="detail-item">
                <label>NIC Number</label>
                <span>{customer.nicNumber}</span>
              </div>
              <div className="detail-item">
                <label>Birthday</label>
                <span>{formatDate(customer.birthday)}</span>
              </div>
            </div>
          </div>

          {/* Service History Section */}
          <div className="service-history card">
            <div className="history-header">
              <h3>Service History</h3>
              <span className="history-count">
                {(customer.serviceHistory || []).length} job{(customer.serviceHistory || []).length !== 1 ? 's' : ''}
              </span>
            </div>

            {(!customer.serviceHistory || customer.serviceHistory.length === 0) ? (
              <div className="no-history">
                <div className="no-history-icon">📋</div>
                <p>No service history found</p>
                <p className="no-history-subtitle">This customer hasn't had any services yet.</p>
              </div>
            ) : (
              <div className="history-list">
                {(customer.serviceHistory || [])
                  .sort((a, b) => new Date(b.jobDateTime) - new Date(a.jobDateTime))
                  .map((job) => (
                    <div key={job.id} className="history-item">
                      <div className="job-date">
                        <div className="date-primary">
                          {formatDateTime(job.jobDateTime)}
                        </div>
                      </div>
                      <div className="job-services">
                        <div className="services-header">Services Performed:</div>
                        <div className="services-list">
                          {(job.services || []).map((service, index) => (
                            <span key={index} className="service-tag">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="job-status">
                        <span className="status-completed">✓ Completed</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
