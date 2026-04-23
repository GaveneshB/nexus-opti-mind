/**
 * Firebase Cloud Function to Initialize Collections
 * 
 * Deploy this to your Firebase project to auto-populate Firestore collections.
 * 
 * Steps:
 * 1. Copy to: functions/src/initializeCollections.ts
 * 2. Run: firebase deploy --only functions
 * 3. Trigger via Firebase Console or HTTP request
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

interface InitOptions {
  overwrite?: boolean;
  collectionFilter?: string[];
}

/**
 * HTTP trigger to initialize all Firestore collections
 * POST to: https://region-project.cloudfunctions.net/initializeFirestoreCollections
 * 
 * Body: { "overwrite": false, "collectionFilter": ["racks", "vampires"] }
 */
export const initializeFirestoreCollections = functions.https.onRequest(
  async (req, res) => {
    try {
      const options: InitOptions = {
        overwrite: req.body.overwrite || false,
        collectionFilter: req.body.collectionFilter || [],
      };

      const result = await initializeAllCollections(options);
      res.status(200).json(result);
    } catch (error) {
      console.error("Initialization failed:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
);

/**
 * Scheduled trigger - runs daily at 2 AM
 */
export const dailyMetricsCleanup = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("Asia/Kuala_Lumpur")
  .onRun(async (context) => {
    try {
      // Delete old metrics (older than 30 days)
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const racksSnap = await db.collection("racks").get();

      for (const rackDoc of racksSnap.docs) {
        const metricsRef = db.collection("racks").doc(rackDoc.id).collection("metrics");
        const oldMetrics = await metricsRef.where("recordedAt", "<", cutoffDate).limit(100).get();

        const batch = db.batch();
        oldMetrics.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      console.log("Cleanup completed");
      return { success: true };
    } catch (error) {
      console.error("Cleanup failed:", error);
      throw error;
    }
  });

// ============================================================================
// INITIALIZATION LOGIC
// ============================================================================

async function initializeAllCollections(options: InitOptions) {
  const collections = [
    { name: "organizations", data: organizationsData, isRootOnly: true },
    { name: "racks", data: racksData, isRootOnly: false },
    { name: "detected_vampires", data: vampireServersData, isRootOnly: true },
    { name: "thermal_regrets", data: thermalRegretsData, isRootOnly: true },
    { name: "workload_forecasts", data: workloadForecastsData, isRootOnly: true },
    { name: "energy_workloads", data: energyGenomesData, isRootOnly: true },
    { name: "energy_metrics", data: energyMetricsData, isRootOnly: true },
    { name: "alerts", data: alertsData, isRootOnly: true },
    { name: "audit_logs", data: auditLogsData, isRootOnly: true },
    { name: "user_preferences", data: userPreferencesData, isRootOnly: true },
  ];

  const results: Record<string, any> = {};

  for (const collection of collections) {
    // Skip if filter is specified and collection not in filter
    if (options.collectionFilter?.length && !options.collectionFilter.includes(collection.name)) {
      continue;
    }

    try {
      const result = await initializeCollection(collection.name, collection.data, options);
      results[collection.name] = result;
    } catch (error) {
      results[collection.name] = {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    status: "completed",
    timestamp: new Date().toISOString(),
    collections: results,
  };
}

async function initializeCollection(collectionName: string, data: any, options: InitOptions) {
  const batch = db.batch();
  let docCount = 0;

  if (Array.isArray(data)) {
    // Handle array data (like racks)
    for (const [docId, docData] of data) {
      const docRef = db.collection(collectionName).doc(docId);

      // Check if document exists
      const docSnap = await docRef.get();
      if (docSnap.exists && !options.overwrite) {
        continue;
      }

      batch.set(docRef, docData, { merge: !options.overwrite });
      docCount++;
    }
  } else {
    // Handle object data
    for (const [docId, docData] of Object.entries(data)) {
      const docRef = db.collection(collectionName).doc(docId);

      // Check if document exists
      const docSnap = await docRef.get();
      if (docSnap.exists && !options.overwrite) {
        continue;
      }

      batch.set(docRef, docData, { merge: !options.overwrite });
      docCount++;
    }
  }

  await batch.commit();

  return {
    status: "success",
    documentsCreated: docCount,
    message: `Created/updated ${docCount} documents in ${collectionName}`,
  };
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const organizationsData = {
  "org-001": {
    orgName: "NexusOp Primary Datacenter",
    timezone: "Asia/Kuala_Lumpur",
    currency: "RM",
    datacenters: ["DC-KL-01", "DC-KL-02"],
    alertThresholds: {
      temperatureMax: 28,
      powerDrawMax: 5000,
      idleScoreThreshold: 0.75,
      costThreshold: 50,
    },
    createdAt: admin.firestore.Timestamp.now(),
  },
};

const racksData = Array.from({ length: 30 }, (_, i) => {
  const row = Math.floor(i / 6);
  const col = (i % 6) + 1;
  const rackId = `${String.fromCharCode(65 + row)}${col}`;

  return [
    rackId,
    {
      id: rackId,
      location: `Row ${String.fromCharCode(65 + row)}, Column ${col}`,
      temperature: 22 + Math.random() * 6,
      loadPercentage: 40 + Math.random() * 40,
      powerConsumption: 1500 + Math.random() * 2500,
      hasVampireServer: false,
      lastUpdated: admin.firestore.Timestamp.now(),
      avgPowerLast1h: 1800 + Math.random() * 2000,
      coolingStatus: "optimal",
      serverCount: Math.floor(8 + Math.random() * 12),
    },
  ];
});

const vampireServersData = {
  "srv-0847": {
    serverId: "SRV-0847",
    rack: "B3",
    slot: 12,
    powerDraw: 340,
    computeUtilization: 0.2,
    dailyCost: 28.4,
    uptime: "47d 12h",
    flagged: true,
    detectedAt: admin.firestore.Timestamp.now(),
    powerPerComputeUnit: 1700,
    idleScore: 0.784,
    severity: "high",
    recommendation: "Server idle 99.8% despite 340W draw. Consider decommissioning.",
  },
  "srv-1203": {
    serverId: "SRV-1203",
    rack: "D5",
    slot: 8,
    powerDraw: 280,
    computeUtilization: 0.0,
    dailyCost: 23.3,
    uptime: "112d 3h",
    flagged: true,
    detectedAt: admin.firestore.Timestamp.now(),
    powerPerComputeUnit: Infinity,
    idleScore: 0.92,
    isDuplicate: true,
    severity: "critical",
    recommendation: "Decommission immediately. Identical profile to primary server.",
  },
};

const thermalRegretsData = {
  "regret-001": {
    rack: "C3",
    timestamp: admin.firestore.Timestamp.now(),
    regretAmount: 214,
    currency: "RM",
    reason: "Over-cooled by 4°C during low-load period",
    optimalAction: "Reduce fan speed to 60%, save 2.1 kWh",
    estimatedSavings: 2.1,
  },
};

const workloadForecastsData = {
  "forecast-001": {
    forecastId: "FORECAST-001",
    forecastType: "surge",
    severity: "high",
    message: "Compute surge forming in 18 minutes",
    recommendedAction: "Pre-cool now — increase fan to 85%",
    eta: 18,
    timestamp: admin.firestore.Timestamp.now(),
    affectedRacks: ["B7", "B8"],
    confidence: 0.92,
  },
};

const energyGenomesData = {
  "wl-alpha": {
    workloadId: "WL-Alpha",
    workloadType: "ML Training",
    powerPhases: [0.2, 0.8, 1.0, 0.9, 0.6, 0.3, 0.1],
    averagePower: 4200,
    relatedWorkloadId: "WL-Gamma",
    createdAt: admin.firestore.Timestamp.now(),
    peakPower: 5500,
  },
};

const energyMetricsData = {
  "metric-hourly-20260417": {
    timestamp: admin.firestore.Timestamp.now(),
    totalPowerConsumption: 52340,
    averageCoolingCost: 1250.5,
    carbonEmissions: 18.5,
    efficiencyScore: 78.2,
    period: "hourly",
    pue: 1.45,
  },
};

const alertsData = {
  "alert-001": {
    alertId: "ALERT-001",
    severity: "critical",
    type: "VampireServer",
    title: "Critical Vampire Server Detected",
    description: "Server SRV-1203 consuming 280W with 0% utilization",
    affectedResource: "SRV-1203",
    affectedRack: "D5",
    timestamp: admin.firestore.Timestamp.now(),
    status: "open",
  },
};

const auditLogsData = {
  "log-001": {
    timestamp: admin.firestore.Timestamp.now(),
    action: "ALERT_CREATED",
    userId: "system",
    resourceType: "VampireServer",
    resourceId: "SRV-1203",
    userAgent: "Cloud-Function",
  },
};

const userPreferencesData = {
  "user-admin-001": {
    userId: "admin-001",
    email: "admin@nexusop.local",
    role: "admin",
    preferences: {
      theme: "dark",
      timezone: "Asia/Kuala_Lumpur",
      currency: "RM",
      refreshInterval: 30,
    },
    createdAt: admin.firestore.Timestamp.now(),
  },
};
