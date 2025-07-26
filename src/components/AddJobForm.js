import React, { useState } from 'react';
import './AddJobForm.css';

const AddJobForm = ({ customer, onSaveJob, onBack }) => {
  const [selectedService, setSelectedService] = useState('');
  const [servicesToAdd, setServicesToAdd] = useState([]);

  const availableServices = [
    'Oil Change',
    'Filter Replace',
    'Tire Rotation',
    'Brake Check',
    'Engine Tune-up',
    'Battery Check',
    'Air Filter Change',
    'Spark Plug Replace',
    'Transmission Service',
    'Coolant Flush',
    'Power Steering Service',
    'Wheel Alignment',
    'Suspension Check',
    'AC Service',
    'Exhaust System Check'
  ];

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleAddService = () => {
    if (selectedService && !servicesToAdd.includes(selectedService)) {
      setServicesToAdd([...servicesToAdd, selectedService]);
      setSelectedService('');
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setServicesToAdd(servicesToAdd.filter(service => service !== serviceToRemove));
  };

  const handleSaveJob = () => {
    if (servicesToAdd.length > 0) {
      onSaveJob({
        services: servicesToAdd
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddService();
    }
  };

  return (
    <div className="add-job-page">
      <div className="container">
        <div className="job-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <h1>Add New Service Job</h1>
        </div>

        <div className="job-form card">
          {/* Customer Info Section */}
          <div className="customer-summary">
            <div className="summary-header">
              <h3>Customer Information</h3>
            </div>
            <div className="summary-details">
              <div className="summary-item">
                <label>Customer Name</label>
                <span>{customer.fullName}</span>
              </div>
              <div className="summary-item">
                <label>Vehicle Number</label>
                <span className="vehicle-highlight">{customer.vehicleNumber}</span>
              </div>
              <div className="summary-item">
                <label>Vehicle Model</label>
                <span>{customer.vehicleModel}</span>
              </div>
              <div className="summary-item">
                <label>Date & Time</label>
                <span className="datetime-highlight">{getCurrentDateTime()}</span>
              </div>
            </div>
          </div>

          {/* Service Selection Section */}
          <div className="service-selection">
            <h3>Select Services</h3>
            
            <div className="service-input-group">
              <div className="service-select-container">
                <label htmlFor="serviceSelect" className="form-label">
                  Select Service
                </label>
                <select
                  id="serviceSelect"
                  className="input-field service-select"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  onKeyPress={handleKeyPress}
                >
                  <option value="">Choose a service...</option>
                  {availableServices
                    .filter(service => !servicesToAdd.includes(service))
                    .map(service => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                </select>
              </div>
              
              <button
                type="button"
                className="btn add-service-btn"
                onClick={handleAddService}
                disabled={!selectedService || servicesToAdd.includes(selectedService)}
              >
                ➕ Add Service
              </button>
            </div>
          </div>

          {/* Services to be Added List */}
          <div className="services-list-section">
            <h3>Services To Be Added</h3>
            
            {servicesToAdd.length === 0 ? (
              <div className="no-services">
                <div className="no-services-icon">🔧</div>
                <p>No services selected yet</p>
                <p className="no-services-subtitle">Select services from the dropdown above</p>
              </div>
            ) : (
              <div className="services-list">
                {servicesToAdd.map((service, index) => (
                  <div key={index} className="service-item">
                    <span className="service-name">{service}</span>
                    <button
                      type="button"
                      className="remove-service-btn"
                      onClick={() => handleRemoveService(service)}
                      title={`Remove ${service}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              Cancel
            </button>
            <button
              type="button"
              className="btn save-job-btn"
              onClick={handleSaveJob}
              disabled={servicesToAdd.length === 0}
            >
              💾 Save Job ({servicesToAdd.length} service{servicesToAdd.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJobForm;
