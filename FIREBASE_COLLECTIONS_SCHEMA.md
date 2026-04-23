# Firebase Firestore Collections - Complete Schema Reference

This document describes all Firestore collections needed for nexusOp with complete field specifications.

---

## Table of Contents
1. [Collections Overview](#collections-overview)
2. [Detailed Schema for Each Collection](#detailed-schema)
3. [How to Create Collections](#how-to-create)
4. [Sample Data](#sample-data)

---

## Collections Overview

| Collection | Purpose | TTL | Scaling |
|-----------|---------|-----|---------|
| **racks** | Physical datacenter rack metadata | Long-term | High (30-100s) |
| **racks/{id}/metrics** | Time-series metrics per rack | 30 days | Very High (millions) |
| **detected_vampires** | Idle power-hungry servers | Long-term | Medium (50-200) |
| **thermal_regrets** | Wasted cooling costs | 90 days | High (1000s/day) |
| **workload_forecasts** | Predicted energy events | 7 days | Medium (100s/day) |
| **energy_workloads** | Workload patterns (ML genome) | Long-term | Medium (10-100) |
| **energy_metrics** | Overall KPIs | 1 year | Medium (daily/hourly) |
| **alerts** | System alerts and incidents | 90 days | Medium (100s) |
| **audit_logs** | Activity tracking | 1 year | High (1000s/day) |
| **user_preferences** | User settings | Long-term | Low (10-100) |
| **organizations** | Organization settings | Long-term | Low (1-10) |

---

## Detailed Schema

### 1. ORGANIZATIONS Collection

**Purpose**: Store organization-level configuration and settings

**Document ID**: `org-001` (one per organization)

**Fields**:
```typescript
{
  orgName: string;                    // Organization name
  timezone: string;                   // e.g., "Asia/Kuala_Lumpur"
  currency: string;                   // e.g., "RM", "USD"
  datacenters: string[];              // List of datacenter IDs
  apiKeys: string[];                  // API authentication keys
  alertThresholds: {
    temperatureMax: number;           // Max safe temperature (°C)
    powerDrawMax: number;             // Max power per rack (W)
    idleScoreThreshold: number;       // Vampire detection threshold (0-1)
    costThreshold: number;            // Alert cost threshold (currency)
  };
  createdAt: Timestamp;               // Creation date
  updatedAt: Timestamp;               // Last update
}
```

**Indexes**: None needed

---

### 2. RACKS Collection

**Purpose**: Static metadata for physical racks

**Document ID**: `A1`, `A2`, ..., `F5` (5 rows × 6 cols = 30 racks)

**Fields**:
```typescript
{
  id: string;                         // Rack identifier (e.g., "A1")
  location: string;                   // Physical location description
  temperature: number;                // Current temperature (°C)
  loadPercentage: number;             // Utilization 0-100%
  powerConsumption: number;           // Current power draw (W)
  hasVampireServer: boolean;          // Vampire detection flag
  serverCount: number;                // Number of servers in rack
  coolingStatus: string;              // "optimal", "warning", "critical"
  lastUpdated: Timestamp;             // Last metric update
  avgPowerLast1h: number;             // Rolling average (W)
  maxTempToday: number;               // Peak temperature today (°C)
}
```

**Indexes**: 
- `hasVampireServer` (ascending)
- `coolingStatus` (ascending)

**Subcollection**: `metrics/` (time-series data)

---

### 3. RACKS/{id}/METRICS Subcollection

**Purpose**: Time-series metrics for each rack (one per minute)

**Document ID**: Unix timestamp (e.g., `1713450000000`)

**Fields**:
```typescript
{
  rackId: string;                     // Parent rack ID
  timestamp: Timestamp;               // Exact measurement time
  recordedAt: Timestamp;              // When recorded
  temperature: number;                // Temperature (°C)
  powerDraw: number;                  // Power consumption (W)
  cpuLoad: number;                    // CPU utilization 0-100%
  memoryUtilization: number;          // Memory 0-100%
  networkBandwidth: number;           // Network usage (Mbps)
}
```

**Indexes**:
- `rackId + recordedAt` (ascending, for time range queries)
- `rackId + temperature` (for thermal analysis)

**TTL**: 30 days (auto-delete older documents)

---

### 4. DETECTED_VAMPIRES Collection

**Purpose**: Identified inefficient idle servers

**Document ID**: `srv-0847`, `srv-1203`, etc.

**Fields**:
```typescript
{
  serverId: string;                   // Server identifier
  rack: string;                       // Rack location
  slot: number;                       // Slot in rack
  powerDraw: number;                  // Current power (W)
  computeUtilization: number;         // CPU usage 0-100%
  memoryUtilization: number;          // Memory usage 0-100%
  networkBandwidth: number;           // Network usage (Mbps)
  dailyCost: number;                  // Daily cost (currency)
  costPerMonth: number;               // Monthly cost (calculated)
  uptime: string;                     // Uptime string (e.g., "47d 12h")
  flagged: boolean;                   // Is flagged as vampire
  severity: string;                   // "low", "medium", "high", "critical"
  idleScore: number;                  // Idle detection score (0-1)
  powerPerComputeUnit: number;        // Power efficiency ratio
  isDuplicate: boolean;               // Likely duplicate/redundant
  cpuTemperature: number;             // CPU temp (°C)
  lastPingTime: Timestamp;            // Last ping time
  detectedAt: Timestamp;              // When detected
  resolvedAt: Timestamp | null;       // When resolved/decommissioned
  recommendation: string;             // Action recommendation
  os: string;                         // Operating system
}
```

**Indexes**:
- `flagged + severity` (ascending)
- `idleScore` (descending, to find worst vampires)
- `dailyCost` (descending)
- `detectedAt` (ascending)

---

### 5. THERMAL_REGRETS Collection

**Purpose**: Log and track wasted cooling costs

**Document ID**: Auto-generated or `regret-` + timestamp

**Fields**:
```typescript
{
  rack: string;                       // Affected rack
  timestamp: Timestamp;               // When regret occurred
  regretAmount: number;               // Cost wasted (currency)
  currency: string;                   // Currency code
  reason: string;                     // Why cooling was inefficient
  optimalAction: string;              // Recommended correction
  estimatedSavings: number;           // Potential energy saved (kWh)
  energyWasted: number;               // Actual energy wasted (kWh)
  coolingMode: string;                // "full-load", "chiller", "free-cool"
  ambientTemp: number;                // Outside temperature (°C)
  setpointTemp: number;               // Target temperature (°C)
  actualTemp: number;                 // Actual temperature (°C)
}
```

**Indexes**:
- `rack + timestamp` (desc, for rack history)
- `regretAmount` (descending, for worst regrets)
- `timestamp` (descending, for recent regrets)

**TTL**: 90 days

---

### 6. WORKLOAD_FORECASTS Collection

**Purpose**: Predicted energy demand and optimization events

**Document ID**: `forecast-` + UUID

**Fields**:
```typescript
{
  forecastId: string;                 // Unique forecast ID
  forecastType: string;               // "surge", "thermal", "green", "maintenance"
  severity: string;                   // "low", "medium", "high"
  message: string;                    // Human-readable prediction
  recommendedAction: string;          // Suggested action
  eta: number;                        // Minutes until event (0-1440)
  timestamp: Timestamp;               // When forecast created
  affectedRacks: string[];            // List of affected rack IDs
  predictedPowerIncrease: number;     // Expected power rise (W)
  predictedTempRise: number;          // Expected temp rise (°C)
  greenEnergyPercentage: number;      // % renewable energy (0-100)
  confidence: number;                 // Prediction confidence (0-1)
  source: string;                     // Source (ml-predictor, weather-api, etc)
}
```

**Indexes**:
- `forecastType + timestamp` (desc)
- `severity + eta` (asc, for urgent alerts)
- `timestamp` (desc, for recent forecasts)

**TTL**: 7 days (auto-delete after forecast window passes)

---

### 7. ENERGY_WORKLOADS Collection

**Purpose**: Workload energy pattern database (ML genome mapping)

**Document ID**: `wl-alpha`, `wl-beta`, `ml-job-123`, etc.

**Fields**:
```typescript
{
  workloadId: string;                 // Unique workload ID
  workloadType: string;               // "ML Training", "Data Pipeline", "ETL", etc
  powerPhases: number[];              // Power consumption pattern (0-1 scale, 7-12 phases)
  averagePower: number;               // Average power (W)
  peakPower: number;                  // Maximum power (W)
  averageDuration: number;            // Typical duration (minutes)
  relatedWorkloadId: string | null;   // Similar/matching workload
  frequency: string;                  // "continuous", "hourly", "daily", "4/day"
  createdAt: Timestamp;               // When first seen
  lastSeen: Timestamp;                // Last execution
  metadata: {
    framework: string;                // Tech stack (TensorFlow, Spark, etc)
    dataSize: string;                 // Data volume (e.g., "450GB")
    nodeCount: number;                // Servers used
    estimatedCost: number;            // Cost per run (currency)
  };
}
```

**Indexes**:
- `workloadType` (ascending)
- `averagePower` (descending)
- `lastSeen` (descending)

---

### 8. ENERGY_METRICS Collection

**Purpose**: Overall KPI aggregations (hourly, daily, weekly)

**Document ID**: `metric-hourly-20260417`, `metric-daily-20260416`

**Fields**:
```typescript
{
  timestamp: Timestamp;               // Period end time
  period: string;                     // "hourly", "daily", "weekly"
  datacenter: string;                 // Datacenter ID
  
  // Power metrics
  totalPowerConsumption: number;      // Total power (W)
  averageCoolingCost: number;         // Cooling cost for period
  peakLoad: number;                   // Peak utilization %
  averageLoad: number;                // Average utilization %
  
  // Efficiency metrics
  efficiencyScore: number;            // Overall efficiency 0-100
  coolingEfficiency: number;          // Cooling PUE (0-2)
  pue: number;                        // Power Usage Effectiveness
  
  // Environmental
  carbonEmissions: number;            // CO2 equivalent (kg)
  
  // Status
  topAlert: string;                   // Most critical alert
  
  // Capacity
  metrics: {
    racksOnline: number;              // Number of active racks
    serversActive: number;            // Active servers
    serversPoweredOff: number;        // Powered off servers
    uptime: number;                   // System uptime %
  };
}
```

**Indexes**:
- `period + timestamp` (desc)
- `efficiencyScore` (asc, trending)
- `carbonEmissions` (asc, trending)

---

### 9. ALERTS Collection

**Purpose**: Active and historical system alerts

**Document ID**: Auto-generated or `alert-` + timestamp

**Fields**:
```typescript
{
  alertId: string;                    // Unique alert ID
  severity: string;                   // "low", "medium", "high", "critical"
  type: string;                       // "VampireServer", "ThermalRegret", "Forecast", etc
  title: string;                      // Alert title
  description: string;                // Detailed description
  affectedResource: string;           // Server/rack/workload ID
  affectedRack: string;               // Rack ID
  timestamp: Timestamp;               // When alert occurred
  createdAt: Timestamp;               // When created
  resolvedAt: Timestamp | null;       // When resolved
  status: string;                     // "open", "acknowledged", "resolved"
  estimatedCost: number;              // Financial impact (currency)
  recommendedAction: string;          // Suggested fix
  
  // Acknowledgment tracking
  acknowledgedBy: string | null;      // User ID who acknowledged
  acknowledgedAt: Timestamp | null;   // When acknowledged
}
```

**Indexes**:
- `severity + status` (asc)
- `timestamp` (desc)
- `status + createdAt` (desc)

**TTL**: 90 days

---

### 10. AUDIT_LOGS Collection

**Purpose**: System activity and compliance logging

**Document ID**: Auto-generated or `log-` + timestamp

**Fields**:
```typescript
{
  timestamp: Timestamp;               // Action time
  action: string;                     // e.g., "ALERT_CREATED", "FORECAST_GENERATED"
  userId: string;                     // User ID (or "system")
  resourceType: string;               // Type of resource affected
  resourceId: string;                 // ID of affected resource
  details: Record<string, any>;       // Action-specific details
  ip: string;                         // Source IP
  userAgent: string;                  // Client info
  status: string;                     // "success", "failure"
  errorMessage: string | null;        // If failed
}
```

**Indexes**:
- `timestamp` (desc)
- `userId + timestamp` (desc)
- `action + timestamp` (desc)

**TTL**: 1 year

---

### 11. USER_PREFERENCES Collection

**Purpose**: User-specific settings and preferences

**Document ID**: User ID (e.g., `admin-001`)

**Fields**:
```typescript
{
  userId: string;                     // Unique user ID
  email: string;                      // User email
  role: string;                       // "admin", "analyst", "viewer"
  preferences: {
    theme: string;                    // "light", "dark"
    timezone: string;                 // "Asia/Kuala_Lumpur"
    currency: string;                 // "RM", "USD"
    notificationChannels: string[];   // ["email", "dashboard", "slack"]
    alertThresholds: {
      vampireIdleScore: number;       // Custom threshold
      thermalRegret: number;          // Alert if cost > this
      temperatureWarn: number;        // Warning threshold °C
    };
    defaultView: string;              // "dashboard", "vampires", "metrics"
    refreshInterval: number;          // UI refresh rate (seconds)
  };
  
  // Tracking
  createdAt: Timestamp;
  lastLogin: Timestamp;
}
```

**Indexes**: None needed

---

## How to Create Collections

### Option 1: Manual Creation in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `nexusop-2be8b`
3. Navigate to **Firestore Database**
4. Click **Start collection**
5. Enter collection name (e.g., `racks`)
6. Add first document with sample data

### Option 2: Use Provided Cloud Function

```bash
# Deploy the initialization function
firebase deploy --only functions

# Trigger via HTTP
curl -X POST https://region-project.cloudfunctions.net/initializeFirestoreCollections \
  -H "Content-Type: application/json" \
  -d '{"overwrite": false}'
```

### Option 3: Use Sample Data from Code

```typescript
import {
  organizationsData,
  racksData,
  vampireServersData,
} from "@/lib/firestore-collections";

// Import into Firebase Console or process in a function
```

---

## Firestore Security Rules

Add these rules to your Firestore for proper access control:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users to read non-sensitive data
    match /organizations/{document=**} {
      allow read: if request.auth != null;
    }
    
    match /racks/{document=**} {
      allow read: if request.auth != null;
    }
    
    match /racks/{rackId}/metrics/{document=**} {
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
    
    match /audit_logs/{document=**} {
      allow read: if request.auth.uid == request.resource.data.userId;
    }
    
    match /user_preferences/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Cloud Functions can write everywhere
    match /{document=**} {
      allow write: if request.auth.uid == request.resource.data.systemUser;
    }
  }
}
```

---

## Estimated Costs

| Collection | Documents/Month | Storage | Estimated Cost |
|-----------|-----------------|---------|-----------------|
| racks | 30 | 30 KB | $0.01 |
| racks/metrics | 43,200+ | 100+ MB | $0.50 |
| detected_vampires | 200 | 50 KB | $0.01 |
| thermal_regrets | 30,000 | 50 MB | $0.25 |
| workload_forecasts | 3,000 | 5 MB | $0.03 |
| energy_workloads | 100 | 20 KB | $0.01 |
| energy_metrics | 1,440 | 2 MB | $0.01 |
| alerts | 3,000 | 3 MB | $0.02 |
| audit_logs | 30,000 | 10 MB | $0.05 |
| user_preferences | 100 | 10 KB | $0.01 |
| **TOTAL** | **~80K reads/day** | **170 MB/month** | **~$1/month** |

---

## Next Steps

1. ✅ Copy collection schemas to Firebase Console
2. ✅ Deploy initialization Cloud Function
3. ✅ Apply Security Rules
4. ✅ Start querying with React hooks from `src/hooks/use-firebase.ts`
5. ✅ Build UI components using `useRackMetrics()`, `useVampireServers()`, etc
