import React from 'react';
import './CustomerCard.css';

const CustomerCard = ({ 
  vehicleNumber, 
  customerName, 
  serviceType, 
  phoneNumber, 
  vehicleType, 
  serviceDate,
  onClick 
}) => {
  return (
    <div className="customer-card" onClick={onClick}>
      <div className="card-header">
        <div className="vehicle-info">
          <h3 className="vehicle-number">{vehicleNumber}</h3>
          <span className="vehicle-type-badge">{vehicleType}</span>
        </div>
        <div className="service-date">
          {serviceDate}
        </div>
      </div>
      
      <div className="card-content">
        <div className="customer-details">
          <div className="customer-name">
            <span className="name-icon">👤</span>
            <span>{customerName}</span>
          </div>
          <div className="customer-phone">
            <span className="phone-icon">📞</span>
            <span>{phoneNumber}</span>
          </div>
        </div>
        
        <div className="service-info">
          <div className="service-label">Last Service:</div>
          <div className="service-type">{serviceType}</div>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="view-details">
          <span>View Details</span>
          <span className="arrow">→</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
