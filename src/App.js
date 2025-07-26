import React, { useState } from 'react';
import './App.css';
import SearchPage from './components/SearchPage';
import RegistrationForm from './components/RegistrationForm';
import CustomerProfilePage from './components/CustomerProfilePage';
import AddJobForm from './components/AddJobForm';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [searchVehicleNumber, setSearchVehicleNumber] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Mock customer data - In a real app, this would come from an API
  const [customers, setCustomers] = useState([
    {
      id: 1,
      fullName: 'John Doe',
      mobileNumber: '0771234567',
      address: '123 Main St, Colombo',
      vehicleModel: 'Toyota Corolla',
      vehicleNumber: 'ABC-1234',
      nicNumber: '871234567V',
      birthday: '1987-05-15',
      vehicleType: 'Car',
      serviceHistory: [
        {
          id: 1,
          jobDateTime: '2025-07-20T10:30:00',
          services: ['Oil Change', 'Filter Replace']
        },
        {
          id: 2,
          jobDateTime: '2025-06-15T14:45:00',
          services: ['Tire Rotation', 'Brake Check']
        }
      ]
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      mobileNumber: '0777654321',
      address: '456 Oak Ave, Kandy',
      vehicleModel: 'Honda Civic',
      vehicleNumber: 'XYZ-5678',
      nicNumber: '901234567V',
      birthday: '1990-08-22',
      vehicleType: 'Car',
      serviceHistory: [
        {
          id: 3,
          jobDateTime: '2025-07-18T09:15:00',
          services: ['Oil Change']
        }
      ]
    }
  ]);

  const [allJobs, setAllJobs] = useState([
    {
      id: 1,
      vehicleNumber: 'ABC-1234',
      customerName: 'John Doe',
      phoneNumber: '0771234567',
      vehicleType: 'Car',
      lastService: 'Oil Change',
      jobDateTime: '2025-07-20T10:30:00'
    },
    {
      id: 2,
      vehicleNumber: 'XYZ-5678',
      customerName: 'Jane Smith',
      phoneNumber: '0777654321',
      vehicleType: 'Car',
      lastService: 'Oil Change',
      jobDateTime: '2025-07-18T09:15:00'
    }
  ]);

  const handleSearch = (vehicleNumber) => {
    setSearchVehicleNumber(vehicleNumber);
    const customer = customers.find(c => c.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase());
    
    if (customer) {
      setSelectedCustomer(customer);
      setCurrentPage('customerProfile');
    } else {
      setCurrentPage('registration');
    }
  };

  const handleRegisterCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: customers.length + 1,
      serviceHistory: []
    };
    
    setCustomers([...customers, newCustomer]);
    setSelectedCustomer(newCustomer);
    setCurrentPage('customerProfile');
  };

  const handleAddJob = (jobData) => {
    // Update customer's service history
    const updatedCustomers = customers.map(customer => {
      if (customer.id === selectedCustomer.id) {
        const newJob = {
          id: customer.serviceHistory.length + 1,
          jobDateTime: new Date().toISOString(),
          services: jobData.services
        };
        return {
          ...customer,
          serviceHistory: [...customer.serviceHistory, newJob]
        };
      }
      return customer;
    });
    
    setCustomers(updatedCustomers);
    
    // Update all jobs list
    const newJobEntry = {
      id: allJobs.length + 1,
      vehicleNumber: selectedCustomer.vehicleNumber,
      customerName: selectedCustomer.fullName,
      phoneNumber: selectedCustomer.mobileNumber,
      vehicleType: selectedCustomer.vehicleType,
      lastService: jobData.services[0] || 'Service',
      jobDateTime: new Date().toISOString()
    };
    
    setAllJobs([newJobEntry, ...allJobs]);
    
    // Update selected customer with new service history
    const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer.id);
    setSelectedCustomer(updatedCustomer);
    
    setCurrentPage('customerProfile');
  };

  const navigateTo = (page, customer = null) => {
    setCurrentPage(page);
    if (customer) {
      setSelectedCustomer(customer);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'search':
        return <SearchPage onSearch={handleSearch} onNavigateToDashboard={() => navigateTo('dashboard')} />;
      case 'registration':
        return (
          <RegistrationForm
            vehicleNumber={searchVehicleNumber}
            onRegister={handleRegisterCustomer}
            onBack={() => navigateTo('search')}
          />
        );
      case 'customerProfile':
        return (
          <CustomerProfilePage
            customer={selectedCustomer}
            onAddJob={() => navigateTo('addJob')}
            onBack={() => navigateTo('search')}
          />
        );
      case 'addJob':
        return (
          <AddJobForm
            customer={selectedCustomer}
            onSaveJob={handleAddJob}
            onBack={() => navigateTo('customerProfile')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            jobs={allJobs}
            onNavigateToSearch={() => navigateTo('search')}
            onCustomerSelect={(vehicleNumber) => {
              const customer = customers.find(c => c.vehicleNumber === vehicleNumber);
              if (customer) {
                setSelectedCustomer(customer);
                navigateTo('customerProfile');
              }
            }}
          />
        );
      default:
        return <SearchPage onSearch={handleSearch} onNavigateToDashboard={() => navigateTo('dashboard')} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
