import React, { useState } from 'react';
import './RegistrationForm.css';

const RegistrationForm = ({ vehicleNumber, onRegister, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    address: '',
    vehicleModel: '',
    vehicleNumber: vehicleNumber || '',
    nicNumber: '',
    birthday: '',
    vehicleType: 'Car'
  });

  const [errors, setErrors] = useState({});

  const vehicleTypes = ['Car', 'Van', 'SUV', 'Pickup'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^0\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number (10 digits starting with 0)';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
    }
    
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }
    
    if (!formData.nicNumber.trim()) {
      newErrors.nicNumber = 'NIC number is required';
    } else if (!/^\d{9}[VvXx]$|^\d{12}$/.test(formData.nicNumber)) {
      newErrors.nicNumber = 'Please enter a valid NIC number';
    }
    
    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister(formData);
    }
  };

  return (
    <div className="registration-page">
      <div className="container">
        <div className="registration-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <h1>Register New Customer</h1>
        </div>

        <div className="registration-card card">
          <div className="vehicle-not-found">
            <div className="not-found-icon">🚗</div>
            <p>Vehicle <strong>{vehicleNumber}</strong> not found in our records.</p>
            <p>Please register this customer below:</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`input-field ${errors.fullName ? 'error' : ''}`}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter customer's full name"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber" className="form-label">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  className={`input-field ${errors.mobileNumber ? 'error' : ''}`}
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="0771234567"
                />
                {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                className={`input-field ${errors.address ? 'error' : ''}`}
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicleModel" className="form-label">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleModel"
                  className={`input-field ${errors.vehicleModel ? 'error' : ''}`}
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g., Toyota Corolla"
                />
                {errors.vehicleModel && <span className="error-message">{errors.vehicleModel}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="vehicleType" className="form-label">
                  Vehicle Type *
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  className="input-field"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicleNumber" className="form-label">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  id="vehicleNumber"
                  name="vehicleNumber"
                  className={`input-field ${errors.vehicleNumber ? 'error' : ''}`}
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="ABC-1234"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.vehicleNumber && <span className="error-message">{errors.vehicleNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="nicNumber" className="form-label">
                  NIC Number *
                </label>
                <input
                  type="text"
                  id="nicNumber"
                  name="nicNumber"
                  className={`input-field ${errors.nicNumber ? 'error' : ''}`}
                  value={formData.nicNumber}
                  onChange={handleChange}
                  placeholder="871234567V or 198712345678"
                />
                {errors.nicNumber && <span className="error-message">{errors.nicNumber}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthday" className="form-label">
                Birthday *
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                className={`input-field ${errors.birthday ? 'error' : ''}`}
                value={formData.birthday}
                onChange={handleChange}
              />
              {errors.birthday && <span className="error-message">{errors.birthday}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Cancel
              </button>
              <button type="submit" className="btn save-btn">
                💾 Save Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
