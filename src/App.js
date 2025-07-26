import React, { useState, useCallback } from 'react';
import './App.css';
import SearchPage from './components/SearchPage';
import RegistrationForm from './components/RegistrationForm';
import CustomerProfilePage from './components/CustomerProfilePage';
import AddJobForm from './components/AddJobForm';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { useYellowHut } from './hooks/useYellowHut';

function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [searchVehicleNumber, setSearchVehicleNumber] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState(null);
  
  const { customers, jobs } = useYellowHut();

  const handleSearch = async (vehicleNumber) => {
    setSearchVehicleNumber(vehicleNumber);
    setAppLoading(true);
    setAppError(null);
    
    try {
      const customer = await customers.searchCustomer(vehicleNumber);
      
      if (customer) {
        setSelectedCustomer(customer);
        setCurrentPage('customerProfile');
      } else {
        setCurrentPage('registration');
      }
    } catch (error) {
      setAppError('Error searching for customer. Please try again.');
      console.error('Search error:', error);
    } finally {
      setAppLoading(false);
    }
  };

  const handleRegisterCustomer = async (customerData) => {
    setAppLoading(true);
    setAppError(null);
    
    try {
      const vehicleNumber = customerData.vehicleNumber.toUpperCase();
      const newCustomer = await customers.addCustomer(vehicleNumber, customerData);
      
      setSelectedCustomer(newCustomer);
      setCurrentPage('customerProfile');
    } catch (error) {
      setAppError('Error registering customer. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setAppLoading(false);
    }
  };

  const handleAddJob = async (jobData) => {
    setAppLoading(true);
    setAppError(null);
    
    try {
      const vehicleNumber = selectedCustomer.vehicleNumber;
      await jobs.addJob(vehicleNumber, jobData);
      
      // Refresh customer data to get updated service history
      const updatedCustomer = await customers.searchCustomer(selectedCustomer.vehicleNumber);
      setSelectedCustomer(updatedCustomer);
      
      setCurrentPage('customerProfile');
    } catch (error) {
      setAppError('Error adding job. Please try again.');
      console.error('Add job error:', error);
    } finally {
      setAppLoading(false);
    }
  };

  const navigateTo = (page, customer = null) => {
    setCurrentPage(page);
    if (customer) {
      setSelectedCustomer(customer);
    }
  };

  const handleDashboardCustomerSelect = async (vehicleNumber) => {
    setAppLoading(true);
    try {
      const customer = await customers.searchCustomer(vehicleNumber);
      if (customer) {
        setSelectedCustomer(customer);
        navigateTo('customerProfile');
      }
    } catch (error) {
      setAppError('Error loading customer data.');
      console.error('Dashboard customer select error:', error);
    } finally {
      setAppLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    console.log('🔄 App: loadDashboardData called');
    try {
      console.log('🔄 App: Calling jobs.loadAllJobs()...');
      const result = await jobs.loadAllJobs();
      console.log('✅ App: jobs.loadAllJobs() result:', result);
      return result;
    } catch (error) {
      console.error('❌ App: Error loading dashboard data:', error);
      return [];
    }
  }, [jobs]);

  const renderCurrentPage = () => {
    if (appLoading) {
      return <LoadingSpinner />;
    }

    if (appError) {
      return (
        <div className="error-page">
          <div className="container">
            <div className="error-card card">
              <h2>⚠️ Error</h2>
              <p>{appError}</p>
              <button className="btn" onClick={() => {
                setAppError(null);
                setCurrentPage('search');
              }}>
                Return to Search
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'search':
        return <SearchPage onSearch={handleSearch} onNavigateToDashboard={() => {
          loadDashboardData();
          navigateTo('dashboard');
        }} />;
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
            jobs={[]} // Will be loaded dynamically in the component
            onNavigateToSearch={() => navigateTo('search')}
            onCustomerSelect={handleDashboardCustomerSelect}
            loadJobs={loadDashboardData}
          />
        );
      default:
        return <SearchPage onSearch={handleSearch} onNavigateToDashboard={() => {
          loadDashboardData();
          navigateTo('dashboard');
        }} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;
