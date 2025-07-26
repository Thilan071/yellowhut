# Firebase Deployment Guide for YellowHut

## 🚀 Firebase Setup Instructions

### 1. Firestore Database Structure

Your Firestore database should be structured as follows:

```
customers (collection)
├── ABC-1234 (document - vehicle number as ID)
│   ├── full_name: "John Doe"
│   ├── mobile_number: "0771234567"
│   ├── address: "123 Main St, Colombo"
│   ├── vehicle_model: "Toyota Corolla"
│   ├── nic_number: "871234567V"
│   ├── birthday: "1987-05-15"
│   ├── vehicle_type: "Car"
│   ├── created_at: Timestamp
│   ├── updated_at: Timestamp
│   └── jobs (subcollection)
│       ├── job1 (auto-generated document ID)
│       │   ├── job_datetime: Timestamp
│       │   ├── services: ["Oil Change", "Filter Replace"]
│       │   └── created_at: Timestamp
│       └── job2 (auto-generated document ID)
│           ├── job_datetime: Timestamp
│           ├── services: ["Tire Rotation"]
│           └── created_at: Timestamp
└── XYZ-5678 (document - another vehicle)
    ├── full_name: "Jane Smith"
    └── ... (same structure)
```

### 2. Deploy Firestore Security Rules

1. **Open Firebase Console** → Your Project → Firestore Database → Rules
2. **Replace the default rules** with the content from `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow the app to read and write all data.
    // This is for internal use as per the project scope.
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Click "Publish"** to deploy the rules

### 3. Required Firestore Indexes

Create these composite indexes in Firebase Console → Firestore → Indexes:

#### Collection: `customers/{vehicleNumber}/jobs`
- **Field 1:** `job_datetime` (Descending)
- **Query scope:** Collection

This index is automatically created when you run queries, but you can create it manually for better performance.

### 4. Environment Variables (Optional)

For production, consider moving Firebase config to environment variables:

Create `.env` file in your project root:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyCnL50fhdzLKWESttYVHJnQ2lJ_mtoCvrA
REACT_APP_FIREBASE_AUTH_DOMAIN=yellowhut-518e3.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=yellowhut-518e3
REACT_APP_FIREBASE_STORAGE_BUCKET=yellowhut-518e3.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=420577692373
REACT_APP_FIREBASE_APP_ID=1:420577692373:web:de9ad72bf113afef5e305c
REACT_APP_FIREBASE_MEASUREMENT_ID=G-2E7HVPMWZX
```

Then update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

### 5. Testing the API Functions

You can test the API functions in browser console:

```javascript
// Import functions
import { getCustomer, registerCustomer, addJob, getJobHistory } from './src/firebase/firebaseApi.js';

// Test customer registration
await registerCustomer('TEST-123', {
  full_name: 'Test Customer',
  mobile_number: '0771234567',
  address: 'Test Address',
  vehicle_model: 'Test Vehicle',
  nic_number: '123456789V',
  birthday: '1990-01-01',
  vehicle_type: 'Car'
});

// Test customer retrieval
const customer = await getCustomer('TEST-123');
console.log(customer);

// Test job addition
await addJob('TEST-123', {
  services: ['Oil Change', 'Filter Replace']
});

// Test job history
const history = await getJobHistory('TEST-123');
console.log(history);
```

### 6. Production Deployment

#### Using Firebase Hosting:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your existing project
   - Set public directory to `build`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

### 7. Monitoring and Maintenance

1. **Firestore Usage:** Monitor in Firebase Console → Usage tab
2. **Error Tracking:** Check Firebase Console → Crashlytics (if enabled)
3. **Performance:** Use Firebase Console → Performance tab
4. **Analytics:** View in Firebase Console → Analytics

### 8. Backup Strategy

Set up automated Firestore backups:

1. Go to Firebase Console → Firestore → Backups
2. Create a backup schedule (recommended: daily)
3. Set retention period (recommended: 30 days)

### 9. API Endpoints Summary

The `firebaseApi.js` provides these functions:

| Function | Purpose | Parameters |
|----------|---------|------------|
| `getCustomer(vehicleNumber)` | Get customer by vehicle number | vehicleNumber: string |
| `registerCustomer(vehicleNumber, customerData)` | Register new customer | vehicleNumber: string, customerData: object |
| `addJob(vehicleNumber, jobData)` | Add service job | vehicleNumber: string, jobData: object |
| `getJobHistory(vehicleNumber)` | Get customer's job history | vehicleNumber: string |
| `getAllCustomers()` | Get all customers | none |
| `getAllJobs()` | Get all jobs across customers | none |
| `updateCustomer(vehicleNumber, updateData)` | Update customer info | vehicleNumber: string, updateData: object |

### 10. Troubleshooting

**Common Issues:**

1. **Permission denied:** Check Firestore rules
2. **Index required:** Create required indexes in Firestore Console
3. **Quota exceeded:** Monitor usage in Firebase Console
4. **Network errors:** Check internet connection and Firebase status

**Debug mode:**
Enable Firestore debug logging:
```javascript
import { connectFirestoreEmulator, enableNetwork } from 'firebase/firestore';
// Add to config.js for debugging
```

Your Firebase backend is now ready for production use! 🎉
