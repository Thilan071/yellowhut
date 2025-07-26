import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  arrayUnion
} from "firebase/firestore";
import { db } from "./config";

// Collections
const CUSTOMERS_COLLECTION = "customers";
const JOBS_COLLECTION = "jobs";

// Customer Services
export const customerService = {
  // Add a new customer
  async addCustomer(customerData) {
    try {
      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
        ...customerData,
        createdAt: serverTimestamp(),
        serviceHistory: []
      });
      return { id: docRef.id, ...customerData };
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },

  // Get customer by vehicle number
  async getCustomerByVehicleNumber(vehicleNumber) {
    try {
      const q = query(
        collection(db, CUSTOMERS_COLLECTION), 
        where("vehicleNumber", "==", vehicleNumber.toUpperCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting customer:", error);
      throw error;
    }
  },

  // Get all customers
  async getAllCustomers() {
    try {
      const querySnapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting customers:", error);
      throw error;
    }
  },

  // Update customer
  async updateCustomer(customerId, updateData) {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await updateDoc(customerRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }
};

// Job Services
export const jobService = {
  // Add a new job
  async addJob(jobData) {
    try {
      // Add job to jobs collection
      const jobDocRef = await addDoc(collection(db, JOBS_COLLECTION), {
        ...jobData,
        jobDateTime: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Update customer's service history
      const customerRef = doc(db, CUSTOMERS_COLLECTION, jobData.customerId);
      await updateDoc(customerRef, {
        serviceHistory: arrayUnion({
          id: jobDocRef.id,
          jobDateTime: new Date().toISOString(),
          services: jobData.services
        }),
        updatedAt: serverTimestamp()
      });

      return { id: jobDocRef.id, ...jobData };
    } catch (error) {
      console.error("Error adding job:", error);
      throw error;
    }
  },

  // Get all jobs with customer info
  async getAllJobsWithCustomers() {
    try {
      const jobsQuery = query(
        collection(db, JOBS_COLLECTION), 
        orderBy("createdAt", "desc")
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      
      const jobs = [];
      for (const jobDoc of jobsSnapshot.docs) {
        const jobData = jobDoc.data();
        
        // Get customer data
        const customerDoc = await getDoc(doc(db, CUSTOMERS_COLLECTION, jobData.customerId));
        const customerData = customerDoc.data();
        
        jobs.push({
          id: jobDoc.id,
          ...jobData,
          customerName: customerData?.fullName || "Unknown",
          phoneNumber: customerData?.mobileNumber || "N/A",
          vehicleType: customerData?.vehicleType || "Car",
          vehicleNumber: customerData?.vehicleNumber || "N/A"
        });
      }
      
      return jobs;
    } catch (error) {
      console.error("Error getting jobs:", error);
      throw error;
    }
  },

  // Get jobs for a specific customer
  async getJobsByCustomer(customerId) {
    try {
      const q = query(
        collection(db, JOBS_COLLECTION), 
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting customer jobs:", error);
      throw error;
    }
  }
};

// Utility functions
export const firebaseUtils = {
  // Convert Firestore timestamp to Date
  timestampToDate(timestamp) {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  },

  // Format date for display
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format datetime for display
  formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};
