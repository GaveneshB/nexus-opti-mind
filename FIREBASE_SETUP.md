# Firebase Integration Guide for nexusOp

## Overview

Your project now has full Firebase integration set up with Firestore, Realtime Database, and Analytics. This guide explains how to use the Firebase components created.

## Files Created

### 1. **Core Firebase Setup**
- **`src/lib/firebase.ts`** - Main Firebase initialization
  - Initializes Firestore (Cloud Firestore)
  - Initializes Realtime Database (for fast updates)
  - Initializes Firebase Auth (for future authentication)
  - Initializes Analytics (usage tracking)

### 2. **React Hooks for Firebase**
- **`src/hooks/use-firebase.ts`** - Custom React hooks for real-time data
  - `useFirestoreQuery()` - Subscribe to collection queries
  - `useFirestoreDoc()` - Subscribe to single documents
  - `useRackMetrics()` - Get metrics for a specific rack
  - `useVampireServers()` - Get detected vampire servers
  - `useThermalRegrets()` - Get thermal regret data

### 3. **TypeScript Types**
- **`src/types/firebase.ts`** - Type definitions for all Firestore documents
  - `Rack` - Data center rack
  - `RackMetric` - Time-series metrics
  - `VampireServer` - Detected inefficient servers
  - `ThermalRegret` - Wasted cooling costs
  - `WorkloadForecast` - Predicted energy events
  - `EnergyWorkload` - Workload patterns
  - `EnergyMetric` - Overall KPIs
  - `Organization` - Settings

### 4. **Example Component**
- **`src/components/LiveRackMonitor.tsx`** - Real-time rack monitoring UI
  - Live temperature, power, and CPU graphs
  - Real-time stats updating from Firebase
  - Error handling and loading states

### 5. **Environment Variables**
- **`.env`** - Firebase configuration credentials
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`

## Quick Start

### 1. Install Firebase Package
```bash
bun add firebase
```

### 2. Import Firebase in Your App

The Firebase initialization happens automatically when you import:
```typescript
import { db, auth, rtdb } from "@/lib/firebase";
```

### 3. Use React Hooks in Components

#### Example: Display All Vampire Servers
```typescript
import { useVampireServers } from "@/hooks/use-firebase";

export function VampireDashboard() {
  const { vampires, loading, error } = useVampireServers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {vampires.map((v) => (
        <div key={v.id}>
          <p>{v.serverId}</p>
          <p>Cost: RM{v.dailyCost}/day</p>
          <p>Severity: {v.severity}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Example: Monitor a Specific Rack
```typescript
import { useRackMetrics } from "@/hooks/use-firebase";

export function RackDetails({ rackId }: { rackId: string }) {
  const { metrics, loading } = useRackMetrics(rackId, 60); // Last 60 minutes

  return (
    <div>
      {metrics.length > 0 && (
        <LineChart data={metrics}>
          {/* Your chart here */}
        </LineChart>
      )}
    </div>
  );
}
```

#### Example: Get Thermal Regrets
```typescript
import { useThermalRegrets } from "@/hooks/use-firebase";

export function RegretAnalysis() {
  const { regrets, totalCost, loading } = useThermalRegrets(6); // Last 6 hours

  return (
    <div>
      <h1>Total Wasted: RM{totalCost}</h1>
      {regrets.map((r) => (
        <div key={r.id}>
          <p>Rack {r.rack}: -{r.regretAmount}</p>
          <p>Reason: {r.reason}</p>
        </div>
      ))}
    </div>
  );
}
```

## Firestore Collection Structure

Your Firebase project expects these collections:

```
racks/
  ├── A1/
  │   ├── temperature: 24.5
  │   ├── loadPercentage: 68
  │   ├── powerConsumption: 1250
  │   └── metrics/ (subcollection)
  │       ├── 1713360000000/
  │       │   ├── temperature: 24.5
  │       │   ├── powerDraw: 1250
  │       │   └── recordedAt: Timestamp
  │       └── ...

detected_vampires/
  ├── SRV-0847/
  │   ├── serverId: "SRV-0847"
  │   ├── powerDraw: 340
  │   ├── computeUtilization: 0.2
  │   ├── dailyCost: 28.4
  │   ├── idleScore: 0.784
  │   └── severity: "high"
  └── ...

thermal_regrets/
  ├── docId1/
  │   ├── rack: "C3"
  │   ├── regretAmount: 214
  │   ├── reason: "Over-cooled by 4°C"
  │   └── timestamp: Timestamp
  └── ...

workload_forecasts/
  ├── forecast1/
  │   ├── forecastType: "surge"
  │   ├── severity: "high"
  │   ├── message: "Compute surge forming..."
  │   └── eta: 18
  └── ...

energy_workloads/
  ├── WL-Alpha/
  │   ├── workloadId: "WL-Alpha"
  │   ├── workloadType: "ML Training"
  │   ├── averagePower: 4200
  │   └── powerPhases: [0.2, 0.8, 1.0, ...]
  └── ...

organizations/
  └── org1/
      ├── orgName: "DataCenter Co"
      ├── currency: "RM"
      └── alertThresholds: {...}
```

## How Data Flows

```
1. Physical Sensors/IoT Devices
   ↓
2. Cloud Pub/Sub (ingestion queue)
   ↓
3. Cloud Function (processes data)
   ↓
4. Firestore (stores data)
   ↓
5. React Hooks (subscribe via onSnapshot)
   ↓
6. UI Components (display real-time updates)
```

## Example: Adding Live Updates to Index Page

```typescript
// src/pages/Index.tsx
import { useState } from "react";
import { useVampireServers, useThermalRegrets } from "@/hooks/use-firebase";
import LiveRackMonitor from "@/components/LiveRackMonitor";

const Index = () => {
  const [active, setActive] = useState("overview");
  const { vampires, loading: vampireLoading } = useVampireServers();
  const { regrets, totalCost } = useThermalRegrets(6);

  const renderContent = () => {
    switch (active) {
      case "vampires":
        return (
          <div>
            <h2>Detected Vampire Servers</h2>
            {vampires.map((v) => (
              <LiveRackMonitor key={v.id} rackId={v.rack} />
            ))}
          </div>
        );
      case "thermal":
        return (
          <div>
            <h2>Total Regret: RM{totalCost}/6h</h2>
            {regrets.map((r) => (
              <div key={r.id}>{r.reason}</div>
            ))}
          </div>
        );
      default:
        return <div>Overview</div>;
    }
  };

  return (
    <div>
      <nav>{/* navigation */}</nav>
      <main>{renderContent()}</main>
    </div>
  );
};

export default Index;
```

## Security & Best Practices

### Firestore Security Rules

Deploy these rules to your Firebase project:

```typescript
// In Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reads for authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Allow Cloud Functions to write
    match /{document=**} {
      allow write: if request.auth.uid == "cloud-function"; // Use service account
    }
  }
}
```

### Environment Variables

✅ `.env` file is already in `.gitignore`
✅ API keys are scoped to Firestore/Auth only
✅ Never commit `.env` to version control

### API Rate Limiting

- **Free tier**: 50,000 reads/day
- **Data volume**: ~1 MB/day for 30-rack datacenter
- **Expected cost**: < $1/month

## Troubleshooting

### "Module not found: firebase"
```bash
# Install Firebase
bun install firebase
```

### "VITE_FIREBASE_API_KEY is undefined"
- Check `.env` file has all Firebase variables
- Restart dev server: `bun run dev`

### "Permission denied on collection"
- Check Firestore Security Rules
- Ensure user is authenticated
- Verify collection matches rules

### Real-time updates not working
```typescript
// Make sure you're using the hook inside a component
const { data } = useFirestoreQuery("collectionName");

// Not at module level:
// const data = useFirestoreQuery(...); // ❌ Wrong
```

## Next Steps

1. **Deploy Cloud Functions** for data ingestion (see previous vampire detection example)
2. **Set up Firestore Security Rules** in Firebase Console
3. **Connect IoT devices** to send data via Cloud Pub/Sub
4. **Build dashboards** using the `LiveRackMonitor` and other hooks
5. **Add authentication** (Firebase Auth is already initialized)
6. **Enable Realtime Database** for ultra-fast updates on critical metrics

## Resources

- [Firebase Web SDK Docs](https://firebase.google.com/docs/web)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/get-data)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

Your Firebase integration is now ready to use! Start by importing hooks in your components and connecting to real-time data.
