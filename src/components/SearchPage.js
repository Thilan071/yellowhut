import React, { useState } from 'react';
import './SearchPage.css';

const SearchPage = ({ onSearch, onNavigateToDashboard }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vehicleNumber.trim()) {
      onSearch(vehicleNumber.trim());
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1 className="search-title">YellowHut Customer Data</h1>
          <button 
            className="dashboard-btn"
            onClick={onNavigateToDashboard}
            title="View All Jobs"
          >
            📊 Dashboard
          </button>
        </div>
        
        <div className="search-card card">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="form-group">
              <label htmlFor="vehicleNumber" className="form-label">
                Vehicle Number
              </label>
              <input
                type="text"
                id="vehicleNumber"
                className="input-field search-input"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="Enter vehicle number (e.g., ABC-1234)"
                autoFocus
              />
            </div>
            
            <button type="submit" className="btn search-btn">
              🔍 Search Vehicle
            </button>
          </form>
        </div>

        <div className="search-info">
          <div className="info-card card">
            <h3>Welcome to YellowHut Service Center</h3>
            <p>
              Enter a vehicle number to search for existing customer records or register a new customer.
            </p>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">👤</span>
                <span>Customer Management</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔧</span>
                <span>Service History</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📋</span>
                <span>Job Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
