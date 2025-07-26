import React, { useState } from 'react';
import './SearchPage.css';
import { getAllJobs } from '../firebase/yellowHutApi';
import { testFirebaseConnection } from '../utils/testFirebase';

const SearchPage = ({ onSearch, onNavigateToDashboard }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [testing, setTesting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vehicleNumber.trim()) {
      onSearch(vehicleNumber.trim());
    }
  };

  const handleTestFirebase = async () => {
    setTesting(true);
    setDebugInfo('Testing Firebase connection...');
    
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // First test basic Firebase connectivity
      const connectionTest = await testFirebaseConnection();
      console.log('🧪 Connection test result:', connectionTest);
      
      let debugOutput = `🔥 Firebase Connection Test:\n${connectionTest.message}\n\n`;
      
      if (connectionTest.success) {
        // If connection works, test getAllJobs
        try {
          console.log('🧪 Testing getAllJobs...');
          const jobs = await getAllJobs();
          console.log('🧪 getAllJobs result:', jobs);
          
          debugOutput += `📊 getAllJobs Test:\n✅ Success!\nFound ${jobs.length} jobs in database.\n\nJobs data:\n${JSON.stringify(jobs, null, 2)}`;
        } catch (jobError) {
          console.error('🧪 getAllJobs failed:', jobError);
          debugOutput += `📊 getAllJobs Test:\n❌ Failed!\nError: ${jobError.message}\n\nStack: ${jobError.stack}`;
        }
      }
      
      setDebugInfo(debugOutput);
      
    } catch (error) {
      console.error('🧪 Test failed:', error);
      setDebugInfo(`❌ Test failed!\n\nError: ${error.message}\n\nStack: ${error.stack}`);
    } finally {
      setTesting(false);
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
            
            <button 
              type="button" 
              className="btn" 
              onClick={handleTestFirebase}
              disabled={testing}
              style={{ 
                marginTop: '10px', 
                backgroundColor: '#FF9800',
                opacity: testing ? 0.6 : 1 
              }}
            >
              {testing ? '⏳ Testing...' : '🧪 Test Firebase Connection'}
            </button>
          </form>
        </div>
        
        {debugInfo && (
          <div className="debug-info card" style={{ 
            margin: '20px 0', 
            padding: '15px', 
            backgroundColor: '#f5f5f5',
            borderLeft: '4px solid #2196F3',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '12px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontFamily: 'inherit' }}>🔍 Debug Information:</h4>
            {debugInfo}
          </div>
        )}

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
