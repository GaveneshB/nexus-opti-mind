# Firebase Collection Setup - Quick Start Guide

This guide will help you create all 11 essential Firestore collections for nexusOp in Firebase Console.

## Project Info
- **Project Name**: nexusop-2be8b
- **Console URL**: https://console.firebase.google.com/project/nexusop-2be8b
- **Total Collections**: 11
- **Estimated Time**: 15-20 minutes

---

## ✅ Step-by-Step Collection Creation

### 1️⃣ ORGANIZATIONS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: organizations
First Document ID: org-001

Fields:
┌─ orgName (string)
│  Value: "NexusOp Primary Datacenter"
├─ timezone (string)
│  Value: "Asia/Kuala_Lumpur"
├─ currency (string)
│  Value: "RM"
├─ datacenters (array)
│  Values: ["DC-KL-01", "DC-KL-02"]
├─ createdAt (timestamp)
│  Set to: Current time
├─ alertThresholds (map)
│  ├─ temperatureMax (number): 28
│  ├─ powerDrawMax (number): 5000
│  ├─ idleScoreThreshold (number): 0.75
│  └─ costThreshold (number): 50
```

✅ **Done**: You now have `organizations/org-001`

---

### 2️⃣ RACKS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: racks
First Document ID: A1

Fields (repeat for A1-A6, B1-B6, etc.):
┌─ id (string)
│  Value: "A1" (change for each)
├─ location (string)
│  Value: "Row A, Column 1"
├─ temperature (number)
│  Value: 22-28 (random)
├─ loadPercentage (number)
│  Value: 40-80 (random)
├─ powerConsumption (number)
│  Value: 1500-4000 (random)
├─ hasVampireServer (boolean)
│  Value: false
├─ serverCount (number)
│  Value: 8-20
├─ coolingStatus (string)
│  Value: "optimal"
└─ lastUpdated (timestamp)
   Set to: Current time
```

⚡ **Quick Tip**: Only need to create 3-5 racks for testing. Create A1, B3, D5, C7 (these are referenced in vampire data).

✅ **Done**: You now have `racks/A1`, `racks/B3`, `racks/D5`, `racks/C7`, etc.

---

### 3️⃣ RACKS/{id}/METRICS Subcollection

**Go to**: Any rack document (e.g., racks/A1) → Create Subcollection

```
Subcollection ID: metrics
First Document ID: 1713450000000 (Unix timestamp)

Fields:
┌─ rackId (string)
│  Value: "A1"
├─ temperature (number)
│  Value: 22-28
├─ powerDraw (number)
│  Value: 1500-4000
├─ cpuLoad (number)
│  Value: 0-95
├─ memoryUtilization (number)
│  Value: 30-95
├─ networkBandwidth (number)
│  Value: 0-1000
├─ timestamp (timestamp)
│  Set to: Current time
└─ recordedAt (timestamp)
   Set to: Current time
```

⚡ **Quick Tip**: Create only 1-2 metric documents per rack for testing.

✅ **Done**: You now have `racks/A1/metrics/...`

---

### 4️⃣ DETECTED_VAMPIRES Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: detected_vampires
First Document ID: srv-0847

Documents (create all 3):
```

#### Document 1: srv-0847
```
┌─ serverId (string): "SRV-0847"
├─ rack (string): "B3"
├─ slot (number): 12
├─ powerDraw (number): 340
├─ computeUtilization (number): 0.2
├─ dailyCost (number): 28.4
├─ uptime (string): "47d 12h"
├─ flagged (boolean): true
├─ idleScore (number): 0.784
├─ severity (string): "high"
├─ detectedAt (timestamp): Current time
├─ resolvedAt (null): null
└─ recommendation (string): "Server idle 99.8% despite 340W draw. Consider decommissioning."
```

#### Document 2: srv-1203
```
┌─ serverId (string): "SRV-1203"
├─ rack (string): "D5"
├─ slot (number): 8
├─ powerDraw (number): 280
├─ computeUtilization (number): 0.0
├─ dailyCost (number): 23.3
├─ uptime (string): "112d 3h"
├─ flagged (boolean): true
├─ idleScore (number): 0.92
├─ severity (string): "critical"
├─ isDuplicate (boolean): true
├─ detectedAt (timestamp): Current time
└─ recommendation (string): "Decommission immediately. Identical profile to primary server."
```

#### Document 3: srv-0391
```
┌─ serverId (string): "SRV-0391"
├─ rack (string): "A1"
├─ slot (number): 22
├─ powerDraw (number): 410
├─ computeUtilization (number): 0.5
├─ dailyCost (number): 34.2
├─ uptime (string): "8d 19h"
├─ flagged (boolean): true
├─ idleScore (number): 0.68
├─ severity (string): "medium"
├─ detectedAt (timestamp): Current time
└─ recommendation (string): "Review scheduled maintenance windows. Potential RM 12,491/year savings."
```

✅ **Done**: You now have `detected_vampires/srv-0847`, `srv-1203`, `srv-0391`

---

### 5️⃣ THERMAL_REGRETS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: thermal_regrets
First Document ID: regret-001

Documents (create all 3):
```

#### Document 1: regret-001
```
┌─ rack (string): "C3"
├─ timestamp (timestamp): 2 hours ago
├─ regretAmount (number): 214
├─ currency (string): "RM"
├─ reason (string): "Over-cooled by 4°C during low-load period"
├─ optimalAction (string): "Reduce fan speed to 60%, save 2.1 kWh"
└─ estimatedSavings (number): 2.1
```

#### Document 2: regret-002
```
┌─ rack (string): "A7"
├─ timestamp (timestamp): 3 hours ago
├─ regretAmount (number): 89
├─ currency (string): "RM"
├─ reason (string): "Cooling maintained during ambient drop"
├─ optimalAction (string): "Switch to free cooling mode for 47 minutes"
└─ estimatedSavings (number): 3.5
```

#### Document 3: regret-003
```
┌─ rack (string): "B2"
├─ timestamp (timestamp): 4 hours ago
├─ regretAmount (number): 156
├─ currency (string): "RM"
├─ reason (string): "Redundant cooling loop active on idle servers"
├─ optimalAction (string): "Disable secondary loop, redirect to hot aisle"
└─ estimatedSavings (number): 1.8
```

✅ **Done**: You now have `thermal_regrets/regret-001`, `regret-002`, `regret-003`

---

### 6️⃣ WORKLOAD_FORECASTS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: workload_forecasts
First Document ID: forecast-001

Documents (create all 3):
```

#### Document 1: forecast-001
```
┌─ forecastId (string): "FORECAST-001"
├─ forecastType (string): "surge"
├─ severity (string): "high"
├─ message (string): "Compute surge forming in Rack B7 in 18 minutes"
├─ recommendedAction (string): "Pre-cool now — increase fan to 85%"
├─ eta (number): 18
├─ timestamp (timestamp): Current time
├─ affectedRacks (array): ["B7", "B8"]
└─ confidence (number): 0.92
```

#### Document 2: forecast-002
```
┌─ forecastId (string): "FORECAST-002"
├─ forecastType (string): "thermal"
├─ severity (string): "medium"
├─ message (string): "Outdoor ambient will rise +3°C by 5:00 AM"
├─ recommendedAction (string): "Schedule free cooling window before 4:30 AM"
├─ eta (number): 142
├─ timestamp (timestamp): Current time
├─ affectedRacks (array): ["A1", "A2", "A3", "C5", "C6"]
└─ confidence (number): 0.85
```

#### Document 3: forecast-003
```
┌─ forecastId (string): "FORECAST-003"
├─ forecastType (string): "green"
├─ severity (string): "low"
├─ message (string): "Green energy window opening at 6:15 AM"
├─ recommendedAction (string): "Queue batch jobs for green window"
├─ eta (number): 255
├─ timestamp (timestamp): Current time
├─ affectedRacks (array): ["all"]
└─ confidence (number): 0.78
```

✅ **Done**: You now have `workload_forecasts/forecast-001`, `forecast-002`, `forecast-003`

---

### 7️⃣ ENERGY_WORKLOADS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: energy_workloads
First Document ID: wl-alpha

Create at least 1-2 documents:
```

#### Document 1: wl-alpha
```
┌─ workloadId (string): "WL-Alpha"
├─ workloadType (string): "ML Training"
├─ powerPhases (array): [0.2, 0.8, 1.0, 0.9, 0.6, 0.3, 0.1]
├─ averagePower (number): 4200
├─ peakPower (number): 5500
├─ relatedWorkloadId (string): "WL-Gamma"
├─ frequency (string): "daily"
├─ createdAt (timestamp): Current time
└─ metadata (map):
   ├─ framework (string): "TensorFlow"
   ├─ dataSize (string): "450GB"
   └─ estimatedCost (number): 125.5
```

✅ **Done**: You now have `energy_workloads/wl-alpha`

---

### 8️⃣ ENERGY_METRICS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: energy_metrics
First Document ID: metric-hourly-20260417

Fields:
┌─ timestamp (timestamp): Current time
├─ period (string): "hourly"
├─ totalPowerConsumption (number): 52340
├─ averageCoolingCost (number): 1250.5
├─ carbonEmissions (number): 18.5
├─ efficiencyScore (number): 78.2
├─ pue (number): 1.45
├─ topAlert (string): "Vampire Server Detected"
├─ metrics (map):
│  ├─ racksOnline (number): 28
│  ├─ serversActive (number): 245
│  └─ uptime (number): 99.98
```

✅ **Done**: You now have `energy_metrics/metric-hourly-20260417`

---

### 9️⃣ ALERTS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: alerts
First Document ID: alert-001

Create at least 1 document:
```

#### Document 1: alert-001
```
┌─ alertId (string): "ALERT-001"
├─ severity (string): "critical"
├─ type (string): "VampireServer"
├─ title (string): "Critical Vampire Server Detected"
├─ description (string): "Server SRV-1203 consuming 280W with 0% utilization"
├─ affectedResource (string): "SRV-1203"
├─ affectedRack (string): "D5"
├─ timestamp (timestamp): Current time
├─ status (string): "open"
├─ estimatedCost (number): 23.3
└─ recommendedAction (string): "Decommission server immediately"
```

✅ **Done**: You now have `alerts/alert-001`

---

### 🔟 AUDIT_LOGS Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: audit_logs
First Document ID: log-001

Fields:
┌─ timestamp (timestamp): Current time
├─ action (string): "ALERT_CREATED"
├─ userId (string): "system"
├─ resourceType (string): "VampireServer"
├─ resourceId (string): "SRV-1203"
└─ details (map):
   ├─ serverId (string): "SRV-1203"
   └─ severity (string): "critical"
```

✅ **Done**: You now have `audit_logs/log-001`

---

### 1️⃣1️⃣ USER_PREFERENCES Collection

**Go to**: Firestore Database → Create Collection

```
Collection ID: user_preferences
First Document ID: user-admin-001

Fields:
┌─ userId (string): "admin-001"
├─ email (string): "admin@nexusop.local"
├─ role (string): "admin"
├─ createdAt (timestamp): Current time
└─ preferences (map):
   ├─ theme (string): "dark"
   ├─ timezone (string): "Asia/Kuala_Lumpur"
   ├─ currency (string): "RM"
   └─ refreshInterval (number): 30
```

✅ **Done**: You now have `user_preferences/user-admin-001`

---

## 🎯 Apply Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the entire content with the rules below
3. Click **Publish**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users to read
    match /organizations/{document=**} {
      allow read: if request.auth != null;
    }
    match /racks/{document=**} {
      allow read: if request.auth != null;
    }
    match /detected_vampires/{document=**} {
      allow read: if request.auth != null;
    }
    match /thermal_regrets/{document=**} {
      allow read: if request.auth != null;
    }
    match /workload_forecasts/{document=**} {
      allow read: if request.auth != null;
    }
    match /energy_workloads/{document=**} {
      allow read: if request.auth != null;
    }
    match /energy_metrics/{document=**} {
      allow read: if request.auth != null;
    }
    match /alerts/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Users can read/write only their own preferences
    match /user_preferences/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## ✅ Verification Checklist

- [ ] ✅ organizations (1 doc)
- [ ] ✅ racks (5+ docs)
- [ ] ✅ racks/{id}/metrics (subcollection with 1+ docs)
- [ ] ✅ detected_vampires (3 docs)
- [ ] ✅ thermal_regrets (3 docs)
- [ ] ✅ workload_forecasts (3 docs)
- [ ] ✅ energy_workloads (1+ docs)
- [ ] ✅ energy_metrics (1 doc)
- [ ] ✅ alerts (1 doc)
- [ ] ✅ audit_logs (1 doc)
- [ ] ✅ user_preferences (1 doc)
- [ ] ✅ Security Rules deployed

---

## 🚀 Test Your Setup

Run your React app and test the hooks:

```bash
npm run dev
```

Then create a test component:

```typescript
import { useVampireServers, useThermalRegrets } from "@/hooks/use-firebase";

export function TestDashboard() {
  const { vampires } = useVampireServers();
  const { regrets, totalCost } = useThermalRegrets(6);

  return (
    <div>
      <h1>Vampires: {vampires.length}</h1>
      <h1>Regret Cost: RM{totalCost}</h1>
    </div>
  );
}
```

If you see data loading, **you're all set!** 🎉

---

## 📞 Troubleshooting

**Q: I don't see any data in my collection**
- A: Make sure you added the documents correctly. Check the type of each field.

**Q: Authentication errors when running app**
- A: Your `.env` file already has API keys. Make sure `npm run dev` is running.

**Q: "Permission denied" error**
- A: Check Firestore Security Rules. Make sure you're authenticated.

---

## 📖 Next Steps

1. ✅ Create all 11 collections
2. ✅ Deploy Security Rules
3. ✅ Test with React hooks
4. ✅ Build dashboards with real data
5. ✅ Deploy Cloud Functions for automation

---

**Estimated Time**: 15-20 minutes to complete all collections manually.
**Alternative**: Use the provided Cloud Function (`functions/src/initializeCollections.ts`) to auto-create everything!
