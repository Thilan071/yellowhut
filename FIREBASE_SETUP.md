# Firebase Firestore Database Structure for YellowHut

## Collections

### 1. customers
This collection stores all customer information.

**Document Structure:**
```javascript
{
  fullName: "John Doe",
  mobileNumber: "0771234567",
  address: "123 Main St, Colombo",
  vehicleModel: "Toyota Corolla",
  vehicleNumber: "ABC-1234", // Always stored in uppercase
  nicNumber: "871234567V",
  birthday: "1987-05-15",
  vehicleType: "Car", // Options: Car, Van, SUV, Pickup
  serviceHistory: [
    {
      id: "job-document-id",
      jobDateTime: "2025-07-20T10:30:00",
      services: ["Oil Change", "Filter Replace"]
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. jobs
This collection stores all service jobs performed.

**Document Structure:**
```javascript
{
  customerId: "customer-document-id", // Reference to customer document
  vehicleNumber: "ABC-1234",
  services: ["Oil Change", "Filter Replace"],
  jobDateTime: Timestamp, // When the job was performed
  createdAt: Timestamp,   // When the record was created
  notes: "Optional notes about the job" // Future enhancement
}
```

## Firestore Rules (Security)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to customers collection
    match /customers/{document} {
      allow read, write: if true; // In production, add proper authentication
    }
    
    // Allow read/write access to jobs collection
    match /jobs/{document} {
      allow read, write: if true; // In production, add proper authentication
    }
  }
}
```

## Indexes Required

### Composite Indexes:
1. **customers collection:**
   - Field: `vehicleNumber` (Ascending)
   - Used for: Quick vehicle number searches

2. **jobs collection:**
   - Field: `customerId` (Ascending), `createdAt` (Descending)
   - Used for: Getting customer job history in chronological order
   
   - Field: `createdAt` (Descending)
   - Used for: Dashboard job listing

## Query Patterns

### Search Customer by Vehicle Number:
```javascript
const q = query(
  collection(db, "customers"), 
  where("vehicleNumber", "==", vehicleNumber.toUpperCase())
);
```

### Get All Jobs for Dashboard:
```javascript
const q = query(
  collection(db, "jobs"), 
  orderBy("createdAt", "desc")
);
```

### Get Customer's Job History:
```javascript
const q = query(
  collection(db, "jobs"), 
  where("customerId", "==", customerId),
  orderBy("createdAt", "desc")
);
```

## Data Flow

1. **Customer Search:**
   - Search customers collection by vehicleNumber
   - If found: Display customer profile with service history
   - If not found: Show registration form

2. **Customer Registration:**
   - Add new document to customers collection
   - Initialize with empty serviceHistory array

3. **Add New Job:**
   - Add document to jobs collection
   - Update customer's serviceHistory array using arrayUnion

4. **Dashboard Data:**
   - Query all jobs ordered by createdAt
   - For each job, fetch corresponding customer data
   - Display combined information

## Best Practices

1. **Vehicle Numbers:** Always store in uppercase for consistency
2. **Timestamps:** Use Firestore serverTimestamp() for accurate timing
3. **Service History:** Maintain both in customer document (for quick access) and separate jobs collection (for detailed queries)
4. **Error Handling:** Implement proper try-catch blocks for all Firebase operations
5. **Loading States:** Show loading indicators during Firebase operations
6. **Offline Support:** Firebase automatically handles offline caching

## Future Enhancements

1. **Authentication:** Add Firebase Auth for user management
2. **Real-time Updates:** Use onSnapshot for real-time data updates
3. **Image Storage:** Use Firebase Storage for customer/vehicle photos
4. **Advanced Search:** Implement full-text search using Algolia
5. **Backup:** Set up automated Firestore backups
6. **Analytics:** Track usage patterns with Firebase Analytics
