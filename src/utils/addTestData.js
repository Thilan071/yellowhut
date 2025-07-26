import { addServiceJob, registerNewCustomer } from '../firebase/yellowHutApi';

/**
 * Add test data to Firebase for testing the dashboard
 */
export const addTestData = async () => {
  try {
    console.log('🧪 Adding test data...');
    
    // Test customer 1
    const customer1 = {
      full_name: 'John Silva',
      mobile_number: '077-123-4567',
      address: 'No. 123, Galle Road, Colombo 03',
      vehicle_model: 'Toyota Prius',
      nic_number: '199012345678',
      birthday: '1990-01-15',
      vehicle_type: 'Car'
    };
    
    await registerNewCustomer('ABC-1234', customer1);
    console.log('✅ Customer 1 registered');
    
    // Add job for customer 1
    const job1 = {
      services: ['Oil Change', 'Filter Replacement'],
      technician_name: 'Sunil Perera',
      cost: 3500,
      status: 'Completed',
      notes: 'Regular maintenance service'
    };
    
    await addServiceJob('ABC-1234', job1);
    console.log('✅ Job 1 added');
    
    // Test customer 2
    const customer2 = {
      full_name: 'Priya Fernando',
      mobile_number: '070-987-6543',
      address: 'No. 456, Kandy Road, Malabe',
      vehicle_model: 'Honda Civic',
      nic_number: '198512345678',
      birthday: '1985-05-20',
      vehicle_type: 'Car'
    };
    
    await registerNewCustomer('XYZ-5678', customer2);
    console.log('✅ Customer 2 registered');
    
    // Add job for customer 2
    const job2 = {
      services: ['Brake Inspection', 'Tire Rotation'],
      technician_name: 'Kamal Jayasinghe',
      cost: 2800,
      status: 'Completed',
      notes: 'Brake pads in good condition'
    };
    
    await addServiceJob('XYZ-5678', job2);
    console.log('✅ Job 2 added');
    
    // Test customer 3
    const customer3 = {
      full_name: 'Rajesh Kumar',
      mobile_number: '071-555-7890',
      address: 'No. 789, Negombo Road, Wattala',
      vehicle_model: 'Suzuki Alto',
      nic_number: '197212345678',
      birthday: '1972-12-10',
      vehicle_type: 'Car'
    };
    
    await registerNewCustomer('DEF-9012', customer3);
    console.log('✅ Customer 3 registered');
    
    // Add job for customer 3
    const job3 = {
      services: ['Engine Tune-up', 'AC Service'],
      technician_name: 'Nimal Silva',
      cost: 5200,
      status: 'Completed',
      notes: 'AC cooling improved significantly'
    };
    
    await addServiceJob('DEF-9012', job3);
    console.log('✅ Job 3 added');
    
    console.log('🎉 Test data added successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    return false;
  }
};
