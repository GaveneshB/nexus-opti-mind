# Firebase Collections - Common Queries & Operations

Quick reference for the most common Firestore operations you'll perform on each collection.

---

## 📋 Quick Query Reference

### 1. Get All Vampire Servers (Critical + High Severity)
```typescript
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const q = query(
  collection(db, "detected_vampires"),
  where("flagged", "==", true),
  where("severity", "in", ["critical", "high"])
);
const vampires = await getDocs(q);
vampires.forEach(doc => console.log(doc.data()));
```

### 2. Get Rack Metrics for Last 60 Minutes
```typescript
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const cutoff = new Date(Date.now() - 60 * 60 * 1000);
const q = query(
  collection(db, "racks", "A1", "metrics"),
  where("recordedAt", ">=", cutoff),
  orderBy("recordedAt", "desc")
);
const metrics = await getDocs(q);
```

### 3. Get Thermal Regrets by Rack (Last 6 Hours)
```typescript
const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
const q = query(
  collection(db, "thermal_regrets"),
  where("rack", "==", "C3"),
  where("timestamp", ">=", cutoff),
  orderBy("timestamp", "desc")
);
const regrets = await getDocs(q);
```

### 4. Get Open Alerts
```typescript
const q = query(
  collection(db, "alerts"),
  where("status", "==", "open"),
  orderBy("severity", "asc")
);
const alerts = await getDocs(q);
```

### 5. Get Total Cooling Cost (Last 24h)
```typescript
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
const q = query(
  collection(db, "thermal_regrets"),
  where("timestamp", ">=", cutoff)
);
const regrets = await getDocs(q);
const totalCost = regrets.docs.reduce(
  (sum, doc) => sum + doc.data().regretAmount, 
  0
);
console.log(`Total regret: RM${totalCost}`);
```

### 6. Get Workload Forecast with Highest ETA
```typescript
const q = query(
  collection(db, "workload_forecasts"),
  orderBy("eta", "desc")
);
const forecasts = await getDocs(q);
const nextEvent = forecasts.docs[0];
```

### 7. Find Duplicate Servers (Possible Redundancy)
```typescript
const q = query(
  collection(db, "detected_vampires"),
  where("isDuplicate", "==", true)
);
const duplicates = await getDocs(q);
duplicates.forEach(doc => {
  console.log(`Redundant: ${doc.data().serverId}`);
});
```

### 8. Get User Preferences
```typescript
import { doc, getDoc } from "firebase/firestore";

const userPrefs = await getDoc(doc(db, "user_preferences", "user-admin-001"));
console.log(userPrefs.data().preferences);
```

### 9. Get Audit Log for Specific User (Last 7 Days)
```typescript
const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const q = query(
  collection(db, "audit_logs"),
  where("userId", "==", "admin-001"),
  where("timestamp", ">=", cutoff),
  orderBy("timestamp", "desc")
);
const logs = await getDocs(q);
```

### 10. Get Energy Metrics (Latest Hourly)
```typescript
const q = query(
  collection(db, "energy_metrics"),
  where("period", "==", "hourly"),
  orderBy("timestamp", "desc"),
  limit(1)
);
const latest = await getDocs(q);
const metrics = latest.docs[0].data();
console.log(`Efficiency: ${metrics.efficiencyScore}%`);
```

---

## 🔍 Real-Time Subscriptions (React Hooks)

### Subscribe to Vampire Servers
```typescript
import { useVampireServers } from "@/hooks/use-firebase";

export function VampireList() {
  const { vampires, loading, error } = useVampireServers();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {vampires.map(v => (
        <li key={v.id}>{v.serverId} - {v.severity}</li>
      ))}
    </ul>
  );
}
```

### Subscribe to Rack Metrics
```typescript
import { useRackMetrics } from "@/hooks/use-firebase";

export function RackTrends() {
  const { metrics } = useRackMetrics("A1", 60); // Last 60 min
  
  const avgTemp = metrics.length > 0
    ? metrics.reduce((s, m) => s + m.temperature, 0) / metrics.length
    : 0;
  
  return <div>Average Temp: {avgTemp.toFixed(1)}°C</div>;
}
```

### Subscribe to Thermal Regrets
```typescript
import { useThermalRegrets } from "@/hooks/use-firebase";

export function RegretTracker() {
  const { regrets, totalCost } = useThermalRegrets(6); // Last 6h
  
  return (
    <div>
      <h2>Wasted Energy: RM{totalCost}</h2>
      <p>Incidents: {regrets.length}</p>
    </div>
  );
}
```

---

## ✏️ Write Operations

### Create New Alert
```typescript
import { collection, addDoc } from "firebase/firestore";

const newAlert = await addDoc(collection(db, "alerts"), {
  alertId: `ALERT-${Date.now()}`,
  severity: "high",
  type: "VampireServer",
  title: "New Vampire Detected",
  description: "Server SRV-2024 detected as inefficient",
  affectedResource: "SRV-2024",
  affectedRack: "B5",
  timestamp: new Date(),
  status: "open",
  estimatedCost: 45.2,
  recommendedAction: "Review and decommission",
});
```

### Update Vampire Status (Mark Resolved)
```typescript
import { doc, updateDoc } from "firebase/firestore";

await updateDoc(doc(db, "detected_vampires", "srv-0847"), {
  flagged: false,
  resolvedAt: new Date(),
  status: "decommissioned",
});
```

### Create Thermal Regret Entry
```typescript
const regretEntry = await addDoc(collection(db, "thermal_regrets"), {
  rack: "B3",
  timestamp: new Date(),
  regretAmount: 280,
  currency: "RM",
  reason: "Unnecessary cooling during low-load period",
  optimalAction: "Implement adaptive fan control",
  estimatedSavings: 3.2,
  energyWasted: 4.8,
});
```

### Add Audit Log Entry
```typescript
await addDoc(collection(db, "audit_logs"), {
  timestamp: new Date(),
  action: "VAMPIRE_RESOLVED",
  userId: "admin-001",
  resourceType: "VampireServer",
  resourceId: "srv-0847",
  details: { previousSeverity: "high", resolution: "decommissioned" },
  ip: "192.168.1.100",
  userAgent: "Dashboard",
});
```

### Acknowledge Alert
```typescript
await updateDoc(doc(db, "alerts", "alert-001"), {
  status: "acknowledged",
  acknowledgedBy: "admin-001",
  acknowledgedAt: new Date(),
});
```

---

## 📊 Aggregation Queries (for Reports)

### Monthly Cooling Cost Analysis
```typescript
const startMonth = new Date("2026-04-01");
const endMonth = new Date("2026-05-01");

const q = query(
  collection(db, "thermal_regrets"),
  where("timestamp", ">=", startMonth),
  where("timestamp", "<", endMonth)
);

const results = await getDocs(q);
const stats = results.docs.reduce((acc, doc) => {
  const data = doc.data();
  return {
    totalCost: acc.totalCost + data.regretAmount,
    totalCount: acc.totalCount + 1,
    avgCost: (acc.totalCost + data.regretAmount) / (acc.totalCount + 1),
    byRack: {
      ...acc.byRack,
      [data.rack]: (acc.byRack[data.rack] || 0) + data.regretAmount,
    },
  };
}, { totalCost: 0, totalCount: 0, avgCost: 0, byRack: {} });

console.log(stats);
```

### Efficiency Score Trends (Last 7 Days)
```typescript
const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const q = query(
  collection(db, "energy_metrics"),
  where("period", "==", "daily"),
  where("timestamp", ">=", cutoff),
  orderBy("timestamp", "desc")
);

const results = await getDocs(q);
const trend = results.docs.map(doc => ({
  date: doc.data().timestamp.toDate(),
  score: doc.data().efficiencyScore,
}));
```

### Top 5 Most Costly Vampires
```typescript
const q = query(
  collection(db, "detected_vampires"),
  where("flagged", "==", true),
  orderBy("dailyCost", "desc"),
  limit(5)
);

const top5 = await getDocs(q);
const savings = top5.docs.reduce((sum, doc) => sum + (doc.data().dailyCost * 365), 0);
console.log(`Potential annual savings: RM${savings.toFixed(2)}`);
```

### Alert Summary by Type
```typescript
const q = query(
  collection(db, "alerts"),
  where("status", "==", "open")
);

const results = await getDocs(q);
const summary = results.docs.reduce((acc, doc) => {
  const type = doc.data().type;
  return {
    ...acc,
    [type]: (acc[type] || 0) + 1,
  };
}, {});

console.log("Open alerts by type:", summary);
```

---

## 🔄 Batch Operations

### Acknowledge All Critical Alerts
```typescript
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);

const q = query(
  collection(db, "alerts"),
  where("severity", "==", "critical"),
  where("status", "==", "open")
);

const results = await getDocs(q);
results.docs.forEach(docSnap => {
  batch.update(docSnap.ref, {
    status: "acknowledged",
    acknowledgedBy: "auto-system",
    acknowledgedAt: new Date(),
  });
});

await batch.commit();
```

### Bulk Create Metrics
```typescript
const batch = writeBatch(db);

const metricsData = Array.from({ length: 10 }, (_, i) => ({
  temperature: 24 + Math.random() * 4,
  powerDraw: 2000 + Math.random() * 1500,
  cpuLoad: Math.random() * 90,
  memoryUtilization: 40 + Math.random() * 50,
  networkBandwidth: Math.random() * 500,
  timestamp: new Date(Date.now() - i * 60000),
  recordedAt: new Date(Date.now() - i * 60000),
}));

metricsData.forEach(metric => {
  const ref = doc(
    collection(db, "racks", "A1", "metrics"),
    Date.now() - (Math.random() * 10000) + ""
  );
  batch.set(ref, metric);
});

await batch.commit();
```

---

## 🗑️ Delete Operations

### Delete Old Metrics (Manual Cleanup)
```typescript
const cutoff = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days old

const q = query(
  collection(db, "racks", "A1", "metrics"),
  where("recordedAt", "<", cutoff),
  limit(100) // Delete in batches
);

const results = await getDocs(q);
const batch = writeBatch(db);

results.docs.forEach(docSnap => {
  batch.delete(docSnap.ref);
});

await batch.commit();
```

### Resolve and Archive Old Alerts
```typescript
const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days

const q = query(
  collection(db, "alerts"),
  where("createdAt", "<", cutoff),
  where("status", "!=", "open")
);

const results = await getDocs(q);
const batch = writeBatch(db);

results.docs.forEach(docSnap => {
  batch.delete(docSnap.ref);
  // Optionally log to archive collection first
});

await batch.commit();
```

---

## 💡 Performance Tips

### 1. Use Limits
```typescript
// ❌ Avoid - millions of documents
const allDocs = await getDocs(collection(db, "thermal_regrets"));

// ✅ Better - use limit
const recent = query(
  collection(db, "thermal_regrets"),
  orderBy("timestamp", "desc"),
  limit(100)
);
```

### 2. Index Your Queries
Firebase will prompt you with index URLs for composite queries. Click them to create indexes automatically.

### 3. Cache with React Query
```typescript
import { useQuery } from "@tanstack/react-query";

export function VampireCache() {
  const { data } = useQuery({
    queryKey: ["vampires"],
    queryFn: async () => {
      const q = query(collection(db, "detected_vampires"));
      const results = await getDocs(q);
      return results.docs.map(d => d.data());
    },
    staleTime: 30000, // 30 seconds
  });

  return <div>{data?.length} vampires</div>;
}
```

### 4. Use Subcollections for Time-Series
✅ Do: `racks/A1/metrics` (auto-managed, fast queries)
❌ Avoid: Single metrics collection with millions of docs

---

## 🎯 Common Patterns

### Pattern 1: Real-Time Dashboard
```typescript
export function Dashboard() {
  const { vampires } = useVampireServers();
  const { regrets, totalCost } = useThermalRegrets(6);
  
  return (
    <div>
      <AlertBox vampires={vampires} />
      <CostTracker total={totalCost} />
    </div>
  );
}
```

### Pattern 2: Hourly Report Generation
```typescript
// Cloud Function
export const generateHourlyReport = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    const hour = new Date();
    
    // Aggregate data
    const q = query(collection(db, "alerts"), where("status", "==", "open"));
    const results = await getDocs(q);
    
    // Store report
    await db.collection("reports").doc(`hourly-${hour.toISOString()}`).set({
      timestamp: hour,
      openAlerts: results.size,
      period: "hourly",
    });
  });
```

### Pattern 3: Alert on Threshold
```typescript
// React component
export function AlertMonitor() {
  const { vampires } = useVampireServers();
  
  useEffect(() => {
    const critical = vampires.filter(v => v.severity === "critical");
    if (critical.length > 5) {
      toast.error(`⚠️ ${critical.length} critical vampires detected!`);
    }
  }, [vampires]);
  
  return null;
}
```

---

## 📖 Next Steps

1. Choose a query above that you need
2. Copy and adapt to your use case
3. Test in Firebase Emulator Suite (optional)
4. Deploy when ready

---

All these queries work with the 11 collections already set up!
