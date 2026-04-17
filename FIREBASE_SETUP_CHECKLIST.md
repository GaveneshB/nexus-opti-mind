# Firebase Implementation Checklist

## ✅ Completed Setup

The following files have been created and configured for Firebase integration:

### Created Files
- ✅ `src/lib/firebase.ts` - Firebase initialization module
- ✅ `src/hooks/use-firebase.ts` - React hooks for real-time Firestore queries
- ✅ `src/types/firebase.ts` - TypeScript type definitions
- ✅ `src/components/LiveRackMonitor.tsx` - Example real-time monitoring component
- ✅ `.env` - Firebase configuration variables added
- ✅ `FIREBASE_SETUP.md` - Detailed integration guide

---

## ⚠️ Next Steps (What You Need To Do)

### 1. **Install Firebase Package**
```bash
# Using npm (if npm is available)
npm install firebase

# Or using bun (if bun is installed globally)
bun add firebase

# Or using yarn/pnpm
yarn add firebase
pnpm add firebase
```

**If you have permission issues**, try:
```powershell
# Run PowerShell as Administrator first, then:
npm install firebase
```

### 2. **Set Up Firestore in Firebase Console**

Visit: https://console.firebase.google.com

Your project: **nexusop-2be8b**

Steps:
1. Go to **Firestore Database** → Create Database
2. Start in **Production Mode**
3. Choose region (recommended: closest to your datacenter)
4. Create the following collections with sample data:

```
Collections to create:
├── racks/
├── detected_vampires/
├── thermal_regrets/
├── workload_forecasts/
├── energy_workloads/
├── energy_metrics/
└── organizations/
```

### 3. **Deploy Firestore Security Rules**

Go to **Firebase Console** → **Firestore** → **Rules** tab

Paste these rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated reads to all data
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Only Cloud Functions and Service Accounts can write
    match /{document=**} {
      allow write: if false;
    }
  }
}
```

Click **Publish**

### 4. **Environment Variables Already Set**

Your `.env` file already has:
```
VITE_FIREBASE_API_KEY=AIzaSyA06Ea5uzw_xWiYHJym7ko_sN6lcaoozmk
VITE_FIREBASE_AUTH_DOMAIN=nexusop-2be8b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nexusop-2be8b
VITE_FIREBASE_STORAGE_BUCKET=nexusop-2be8b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=284156449536
VITE_FIREBASE_APP_ID=1:284156449536:web:03f4d925f9be0b6afa19e5
VITE_FIREBASE_MEASUREMENT_ID=G-NLV98D8QWS
```

✅ Ready to use!

### 5. **Start Using in Your App**

Once Firebase package is installed, import and use:

```typescript
// Import Firebase
import { db } from "@/lib/firebase";

// Import hooks
import { useVampireServers, useThermalRegrets, useRackMetrics } from "@/hooks/use-firebase";

// Use in components
export function Dashboard() {
  const { vampires, loading } = useVampireServers();
  const { regrets, totalCost } = useThermalRegrets(6);
  
  return (
    <div>
      <h1>Total Regret: RM{totalCost}</h1>
      {vampires.map(v => <div key={v.id}>{v.serverId}</div>)}
    </div>
  );
}
```

### 6. **Deploy Cloud Functions** (Optional but Recommended)

Set up automated data ingestion and vampire detection:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize functions
firebase init functions

# Deploy
firebase deploy --only functions
```

See `FIREBASE_SETUP.md` for example Cloud Function code.

---

## 📊 Expected Data Flow

```
IoT Sensors → Cloud Pub/Sub → Cloud Functions → Firestore → React Hooks → UI
                (Message Queue)  (Processing)    (Storage)  (Real-time)  (Display)
```

---

## 🔐 Security Notes

- ✅ API keys are scoped to web app only
- ✅ Firestore rules prevent unauthorized writes
- ✅ `.env` is in `.gitignore` (not committed to git)
- ⚠️ Never share your Firebase credentials in public repos

---

## 📝 File Reference

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Initialize Firebase services |
| `src/hooks/use-firebase.ts` | React hooks for real-time queries |
| `src/types/firebase.ts` | TypeScript interfaces for all collections |
| `src/components/LiveRackMonitor.tsx` | Example component using real-time data |
| `.env` | Firebase configuration (kept private) |
| `FIREBASE_SETUP.md` | Detailed integration guide |

---

## ✨ Quick Features You Can Use

Once installed, you have access to:

1. **Live Rack Monitoring** - Real-time temperature, power, CPU
2. **Vampire Detection** - Identify idle power-hungry servers
3. **Thermal Regrets** - Track wasted cooling costs
4. **Workload Forecasts** - Predict energy demands
5. **Energy Genomes** - Pattern matching for similar workloads

---

## 🆘 Troubleshooting

### Firebase not loading
- Check `.env` variables are correct
- Restart development server after installing
- Check browser console for errors

### Firestore queries return empty
- Create collections in Firebase Console
- Add sample documents
- Check Security Rules allow reads

### Need help?
- See `FIREBASE_SETUP.md` for detailed examples
- Check [Firebase documentation](https://firebase.google.com/docs/web)

---

**Status**: Setup complete ✅ | Awaiting Firebase package installation ⏳
