import React, { useState } from 'react';
import './SearchPage.css';
import { registerNewCustomer } from '../firebase/yellowHutApi';

const SearchPage = ({ onSearch, onNavigateToDashboard }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    vehicleNumber: '',
    full_name: '',
    mobile_number: '',
    address: '',
    vehicle_model: '',
    nic_number: '',
    birthday: '',
    vehicle_type: 'Car'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vehicleNumber.trim()) {
      onSearch(vehicleNumber.trim());
    }
  };

  const handleAddNewCustomer = () => {
    setShowAddCustomer(true);
    setCustomerFormData({
      vehicleNumber: '',
      full_name: '',
      mobile_number: '',
      address: '',
      vehicle_model: '',
      nic_number: '',
      birthday: '',
      vehicle_type: 'Car'
    });
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewCustomer = async (e) => {
    e.preventDefault();
    setAddingCustomer(true);
    
    try {
      // Validate required fields
      if (!customerFormData.vehicleNumber || !customerFormData.full_name || !customerFormData.mobile_number) {
        alert('Please fill in Vehicle Number, Full Name, and Mobile Number');
        setAddingCustomer(false);
        return;
      }

      // Register the new customer
      await registerNewCustomer(customerFormData.vehicleNumber.toUpperCase(), customerFormData);
      
      alert(`Customer ${customerFormData.full_name} added successfully!`);
      setShowAddCustomer(false);
      
      // Clear form
      setCustomerFormData({
        vehicleNumber: '',
        full_name: '',
        mobile_number: '',
        address: '',
        vehicle_model: '',
        nic_number: '',
        birthday: '',
        vehicle_type: 'Car'
      });
      
    } catch (error) {
      console.error('Error adding customer:', error);
      alert(`Error adding customer: ${error.message}`);
    } finally {
      setAddingCustomer(false);
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
              onClick={handleAddNewCustomer}
              style={{ 
                marginTop: '10px', 
                backgroundColor: '#4CAF50'
              }}
            >
              ➕ Add New Customer
            </button>
          </form>
        </div>
        
        {/* Add Customer Modal/Form */}
        {showAddCustomer && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="add-customer-modal card" style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px'
            }}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>Add New Customer</h2>
              
              <form onSubmit={handleSubmitNewCustomer}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Vehicle Number *</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      className="input-field"
                      value={customerFormData.vehicleNumber}
                      onChange={handleCustomerFormChange}
                      placeholder="e.g., ABC-1234"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      name="vehicle_type"
                      className="input-field"
                      value={customerFormData.vehicle_type}
                      onChange={handleCustomerFormChange}
                    >
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="SUV">SUV</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Motorcycle">Motorcycle</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      className="input-field"
                      value={customerFormData.full_name}
                      onChange={handleCustomerFormChange}
                      placeholder="e.g., John Silva"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="text"
                      name="mobile_number"
                      className="input-field"
                      value={customerFormData.mobile_number}
                      onChange={handleCustomerFormChange}
                      placeholder="e.g., 077-123-4567"
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="input-field"
                      value={customerFormData.address}
                      onChange={handleCustomerFormChange}
                      placeholder="e.g., No. 123, Galle Road, Colombo 03"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Vehicle Model</label>
                    <input
                      type="text"
                      name="vehicle_model"
                      className="input-field"
                      value={customerFormData.vehicle_model}
                      onChange={handleCustomerFormChange}
                      placeholder="e.g., Toyota Prius"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">NIC Number</label>
                    <input
                      type="text"
                      name="nic_number"
                      className="input-field"
                      value={customerFormData.nic_number}
                      onChange={handleCustomerFormChange}
                      placeholder="e.g., 199012345678"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Birthday</label>
                    <input
                      type="date"
                      name="birthday"
                      className="input-field"
                      value={customerFormData.birthday}
                      onChange={handleCustomerFormChange}
                    />
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  justifyContent: 'flex-end', 
                  marginTop: '25px',
                  borderTop: '1px solid #eee',
                  paddingTop: '20px'
                }}>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => setShowAddCustomer(false)}
                    style={{ backgroundColor: '#6c757d' }}
                    disabled={addingCustomer}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn" 
                    disabled={addingCustomer}
                    style={{ 
                      backgroundColor: '#4CAF50',
                      opacity: addingCustomer ? 0.6 : 1 
                    }}
                  >
                    {addingCustomer ? '⏳ Adding...' : '✅ Add Customer'}
                  </button>
                </div>
              </form>
            </div>
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
