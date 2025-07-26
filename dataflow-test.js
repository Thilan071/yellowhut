// Complete data flow test for YellowHut application
// This verifies that all data operations work correctly

import { 
  registerNewCustomer, 
  addServiceJob, 
  searchCustomer, 
  getAllJobs, 
  getAllCustomers 
} from './src/firebase/yellowHutApi.js';

const testDataFlow = async () => {
  console.log('🧪 Starting YellowHut Data Flow Test...\n');
  
  const testVehicleNumber = 'TEST999';
  const testCustomerData = {
    full_name: 'Test Customer',
    mobile_number: '0771234567',
    address: '123 Test Street, Colombo',
    vehicle_model: 'Toyota Camry 2020',
    nic_number: '123456789V',
    birthday: '1990-01-01',
    vehicle_type: 'Car'
  };
  
  const testJobData = {
    services: ['Oil Change', 'Filter Replacement'],
    technician_name: 'Test Technician',
    cost: 5000,
    status: 'Completed',
    notes: 'Test job for data flow verification'
  };

  try {
    // Test 1: Customer Registration
    console.log('1️⃣ Testing Customer Registration...');
    const newCustomer = await registerNewCustomer(testVehicleNumber, testCustomerData);
    console.log('✅ Customer registered:', newCustomer.fullName);

    // Test 2: Customer Search
    console.log('\n2️⃣ Testing Customer Search...');
    const foundCustomer = await searchCustomer(testVehicleNumber);
    console.log('✅ Customer found:', foundCustomer.fullName);

    // Test 3: Job Addition
    console.log('\n3️⃣ Testing Job Addition...');
    const newJob = await addServiceJob(testVehicleNumber, testJobData);
    console.log('✅ Job added:', newJob.id);

    // Test 4: Dashboard Data Fetching
    console.log('\n4️⃣ Testing Dashboard Data Fetch...');
    const allJobs = await getAllJobs();
    console.log(`✅ Dashboard jobs fetched: ${allJobs.length} jobs found`);

    // Test 5: All Customers Fetch
    console.log('\n5️⃣ Testing All Customers Fetch...');
    const allCustomers = await getAllCustomers();
    console.log(`✅ All customers fetched: ${allCustomers.length} customers found`);

    console.log('\n🎉 All tests passed! YellowHut data flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Export for manual testing
export { testDataFlow };
