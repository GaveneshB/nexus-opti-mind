# Firebase Firestore - Collection Structure Diagram

## 🗂️ Complete Firestore Hierarchy

```
Firestore Database (nexusop-2be8b)
│
├── organizations/                          [1 document - Config]
│   └── org-001
│       ├── orgName: string
│       ├── timezone: string
│       ├── currency: string
│       ├── datacenters: array
│       └── alertThresholds: map
│
├── racks/                                 [30 documents - Infrastructure]
│   ├── A1
│   │   ├── id: string
│   │   ├── location: string
│   │   ├── temperature: number
│   │   ├── loadPercentage: number
│   │   ├── powerConsumption: number
│   │   ├── hasVampireServer: boolean
│   │   ├── lastUpdated: timestamp
│   │   └── metrics/ (subcollection)      [43,000+ documents/month - Time-series]
│   │       ├── 1713450000000
│   │       │   ├── rackId: string
│   │       │   ├── temperature: number
│   │       │   ├── powerDraw: number
│   │       │   ├── cpuLoad: number
│   │       │   ├── memoryUtilization: number
│   │       │   ├── networkBandwidth: number
│   │       │   ├── timestamp: timestamp
│   │       │   └── recordedAt: timestamp
│   │       └── 1713450060000
│   │           └── ... (same fields)
│   │
│   ├── B3
│   │   └── metrics/ (subcollection)
│   │       └── ...
│   │
│   ├── D5
│   │   └── metrics/
│   │       └── ...
│   │
│   └── ... (27 more racks A2-F5)
│
├── detected_vampires/                     [100-200 documents - Inefficiency Detection]
│   ├── srv-0847
│   │   ├── serverId: string
│   │   ├── rack: string
│   │   ├── slot: number
│   │   ├── powerDraw: number
│   │   ├── computeUtilization: number
│   │   ├── dailyCost: number
│   │   ├── uptime: string
│   │   ├── flagged: boolean
│   │   ├── severity: string ("low"|"medium"|"high"|"critical")
│   │   ├── idleScore: number
│   │   ├── isDuplicate: boolean
│   │   ├── detectedAt: timestamp
│   │   └── recommendation: string
│   │
│   ├── srv-1203
│   │   └── ... (same fields)
│   │
│   └── srv-0391
│       └── ... (same fields)
│
├── thermal_regrets/                       [1,000-30,000 documents/month - Cooling Optimization]
│   ├── regret-001
│   │   ├── rack: string
│   │   ├── timestamp: timestamp
│   │   ├── regretAmount: number
│   │   ├── currency: string
│   │   ├── reason: string
│   │   ├── optimalAction: string
│   │   ├── estimatedSavings: number
│   │   └── coolingMode: string
│   │
│   ├── regret-002
│   │   └── ... (same fields)
│   │
│   └── ... (auto-generated documents)
│
├── workload_forecasts/                   [100-3,000 documents/month - Predictions]
│   ├── forecast-001
│   │   ├── forecastId: string
│   │   ├── forecastType: string ("surge"|"thermal"|"green"|"maintenance")
│   │   ├── severity: string ("low"|"medium"|"high")
│   │   ├── message: string
│   │   ├── recommendedAction: string
│   │   ├── eta: number (minutes)
│   │   ├── timestamp: timestamp
│   │   ├── affectedRacks: array
│   │   └── confidence: number (0-1)
│   │
│   ├── forecast-002
│   │   └── ... (same fields)
│   │
│   └── ... (auto-generated documents)
│
├── energy_workloads/                      [10-100 documents - ML Pattern Database]
│   ├── wl-alpha
│   │   ├── workloadId: string
│   │   ├── workloadType: string
│   │   ├── powerPhases: array (0-1 scale)
│   │   ├── averagePower: number
│   │   ├── peakPower: number
│   │   ├── relatedWorkloadId: string
│   │   ├── frequency: string
│   │   ├── createdAt: timestamp
│   │   └── metadata: map
│   │
│   ├── wl-beta
│   │   └── ... (same fields)
│   │
│   ├── wl-gamma
│   │   └── ... (same fields)
│   │
│   └── wl-delta
│       └── ... (same fields)
│
├── energy_metrics/                        [1,440+ documents - KPI Aggregations]
│   ├── metric-hourly-20260417
│   │   ├── timestamp: timestamp
│   │   ├── period: string ("hourly"|"daily"|"weekly")
│   │   ├── totalPowerConsumption: number
│   │   ├── averageCoolingCost: number
│   │   ├── carbonEmissions: number
│   │   ├── efficiencyScore: number
│   │   ├── pue: number
│   │   └── metrics: map
│   │       ├── racksOnline: number
│   │       ├── serversActive: number
│   │       └── uptime: number
│   │
│   ├── metric-hourly-20260416
│   │   └── ... (same fields for previous hour)
│   │
│   ├── metric-daily-20260416
│   │   └── ... (daily aggregation)
│   │
│   └── ... (continuous growth)
│
├── alerts/                                [100-3,000 documents - Alert Management]
│   ├── alert-001
│   │   ├── alertId: string
│   │   ├── severity: string ("low"|"medium"|"high"|"critical")
│   │   ├── type: string ("VampireServer"|"ThermalRegret"|"Forecast")
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── affectedResource: string
│   │   ├── affectedRack: string
│   │   ├── timestamp: timestamp
│   │   ├── status: string ("open"|"acknowledged"|"resolved")
│   │   ├── estimatedCost: number
│   │   ├── recommendedAction: string
│   │   └── acknowledgedBy: string | null
│   │
│   ├── alert-002
│   │   └── ... (same fields)
│   │
│   └── ... (auto-generated documents)
│
├── audit_logs/                            [10,000-30,000 documents/month - Compliance]
│   ├── log-001
│   │   ├── timestamp: timestamp
│   │   ├── action: string (e.g., "ALERT_CREATED")
│   │   ├── userId: string
│   │   ├── resourceType: string
│   │   ├── resourceId: string
│   │   ├── details: map
│   │   ├── ip: string
│   │   ├── userAgent: string
│   │   └── status: string
│   │
│   ├── log-002
│   │   └── ... (same fields)
│   │
│   └── ... (auto-generated documents)
│
└── user_preferences/                      [10-100 documents - User Settings]
    ├── user-admin-001
    │   ├── userId: string
    │   ├── email: string
    │   ├── role: string ("admin"|"analyst"|"viewer")
    │   ├── createdAt: timestamp
    │   └── preferences: map
    │       ├── theme: string
    │       ├── timezone: string
    │       ├── currency: string
    │       ├── refreshInterval: number
    │       └── alertThresholds: map
    │
    ├── user-analyst-001
    │   └── ... (same fields)
    │
    └── ... (one per user)
```

---

## 📊 Collection Statistics

### Total Collections: 11
- **Root-level**: 10 collections
- **Subcollections**: 1 (metrics under racks)

### Document Estimates (Monthly)
```
organizations              1          100 B
racks                     30         30 KB
racks/metrics        43,200         100 MB
detected_vampires        200         50 KB
thermal_regrets       30,000         50 MB
workload_forecasts     3,000         5 MB
energy_workloads         100         20 KB
energy_metrics         1,440         2 MB
alerts                 3,000         3 MB
audit_logs            30,000         10 MB
user_preferences         100         10 KB
────────────────────────────────────
TOTAL                 111,271        170 MB
```

### Read/Write Operations (Daily)
```
Reads:   ~80,000 per day
Writes:  ~5,000 per day
Avg Document Size: 1.5 KB
Total Monthly Data Volume: ~170 MB
Estimated Monthly Cost: ~$1-2 (free tier: 50GB storage)
```

---

## 🔗 Data Relationships

### Key References Between Collections

```
racks/A1 ──────┐
                ├──> racks/A1/metrics ─┐
                └─────────────────────┬─┤
                                      │
detected_vampires/srv-0847 ─────────> "rack": B3
thermal_regrets/regret-001 ──────────> "rack": C3
workload_forecasts/forecast-001 ───→ "affectedRacks": ["B7", "B8"]
alerts/alert-001 ──────────────────→ "affectedRack": D5
audit_logs/log-001 ─────────────────→ "resourceId": SRV-1203
energy_metrics/metric-hourly ──────→ All racks (aggregated)
```

---

## 🔍 Indexes for Performance

### Recommended Composite Indexes

```
Collection: racks
├── hasVampireServer (Asc)
└── coolingStatus (Asc)

Collection: racks/{id}/metrics
├── rackId (Asc) + recordedAt (Desc)
└── rackId (Asc) + temperature (Asc)

Collection: detected_vampires
├── flagged (Asc)
├── severity (Asc)
├── idleScore (Desc)
└── dailyCost (Desc)

Collection: thermal_regrets
├── rack (Asc) + timestamp (Desc)
└── regretAmount (Desc)

Collection: workload_forecasts
├── forecastType (Asc) + timestamp (Desc)
└── severity (Asc) + eta (Asc)

Collection: audit_logs
├── timestamp (Desc)
├── userId (Asc) + timestamp (Desc)
└── action (Asc) + timestamp (Desc)
```

---

## 📡 Real-Time Listeners by Component

### Active Subscriptions Architecture

```
App.tsx
├── <Dashboard>
│   └── useVampireServers()
│       └── onSnapshot(detected_vampires)
│
├── <RackMonitor rackId="A1">
│   └── useRackMetrics("A1", 60)
│       └── onSnapshot(racks/A1/metrics, where ts > 60min ago)
│
├── <ThermalRegrets>
│   └── useThermalRegrets(6)
│       └── onSnapshot(thermal_regrets, where ts > 6h ago)
│
└── <AlertPanel>
    └── useFirestoreQuery("alerts", [where flagged==true])
        └── onSnapshot(alerts)
```

---

## 🔐 Security Rules Scope

```
organizations/*           → Read: authenticated users only
racks/*                   → Read: authenticated users only
racks/*/metrics/*         → Read: authenticated users only
detected_vampires/*       → Read: authenticated users only
thermal_regrets/*         → Read: authenticated users only
workload_forecasts/*      → Read: authenticated users only
energy_workloads/*        → Read: authenticated users only
energy_metrics/*          → Read: authenticated users only
alerts/*                  → Read: authenticated users only
audit_logs/*              → Read: user can only read own activity
user_preferences/{uid}    → Read/Write: user can only access own data

All Collections           → Write: Cloud Functions & service accounts only
```

---

## 💾 Data Retention Policy

| Collection | Keep For | Auto-Delete | Manual Review |
|-----------|----------|-------------|---------------|
| organizations | Forever | No | Quarterly |
| racks | Forever | No | N/A |
| racks/metrics | 30 days | Yes | Weekly |
| detected_vampires | Forever | No | Monthly |
| thermal_regrets | 90 days | Yes | Monthly |
| workload_forecasts | 7 days | Yes | Weekly |
| energy_workloads | Forever | No | Quarterly |
| energy_metrics | 1 year | Manual | Quarterly |
| alerts | 90 days | Yes | Monthly |
| audit_logs | 1 year | Manual | Annually |
| user_preferences | Forever | No | N/A |

---

## 🚀 Migration/Backup Strategy

### Export Collections
```bash
# Export to Firebase Backup Storage
firebase firestore:export gs://nexusop-backups/{timestamp}

# Export specific collection
firebase firestore:export gs://nexusop-backups/{timestamp} \
  --collection-ids=racks,detected_vampires
```

### Restore Collections
```bash
# Restore from backup
firebase firestore:import gs://nexusop-backups/{timestamp}
```

---

This diagram gives you a complete visual reference of your Firestore database structure!
