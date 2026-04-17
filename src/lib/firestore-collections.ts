/**
 * Firestore Collections Setup Script
 * 
 * This module contains initialization data for all Firestore collections.
 * Use these to populate your Firebase project with initial data.
 * 
 * Run this in Firebase Console > Firestore > Add Document, or use the Cloud Function below.
 */

// ============================================================================
// 1. ORGANIZATIONS COLLECTION
// ============================================================================
export const organizationsData = {
  "org-001": {
    orgName: "NexusOp Primary Datacenter",
    timezone: "Asia/Kuala_Lumpur",
    currency: "RM",
    datacenters: ["DC-KL-01", "DC-KL-02"],
    apiKeys: ["key_prod_001", "key_prod_002"],
    alertThresholds: {
      temperatureMax: 28,
      powerDrawMax: 5000,
      idleScoreThreshold: 0.75,
      costThreshold: 50,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// ============================================================================
// 2. RACKS COLLECTION
// ============================================================================
export const racksData = Array.from({ length: 30 }, (_, i) => {
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
      hasVampireServer: Math.random() > 0.85,
      lastUpdated: new Date(),
      avgPowerLast1h: 1800 + Math.random() * 2000,
      maxTempToday: 26 + Math.random() * 4,
      coolingStatus: "optimal",
      serverCount: Math.floor(8 + Math.random() * 12),
    },
  ];
});

// Rack with nested metrics subcollection
export const rackMetricsData = (rackId: string) =>
  Array.from({ length: 60 }, (_, i) => {
    const timestamp = new Date(Date.now() - (59 - i) * 60000); // Last 60 minutes
    return [
      timestamp.getTime().toString(),
      {
        rackId,
        timestamp,
        recordedAt: timestamp,
        temperature: 22 + Math.random() * 8,
        powerDraw: 1500 + Math.random() * 2500,
        cpuLoad: Math.random() * 95,
        memoryUtilization: 30 + Math.random() * 65,
        networkBandwidth: Math.random() * 1000,
      },
    ];
  });

// ============================================================================
// 3. DETECTED VAMPIRES COLLECTION
// ============================================================================
export const vampireServersData = {
  "srv-0847": {
    serverId: "SRV-0847",
    rack: "B3",
    slot: 12,
    powerDraw: 340,
    computeUtilization: 0.2,
    memoryUtilization: 0,
    networkBandwidth: 0,
    dailyCost: 28.4,
    uptime: "47d 12h",
    flagged: true,
    detectedAt: new Date(),
    resolvedAt: null,
    powerPerComputeUnit: 1700,
    idleScore: 0.784,
    isDuplicate: false,
    severity: "high",
    recommendation:
      "Server idle 99.8% despite 340W draw. Consider decommissioning or migrating to energy-efficient VM.",
    cpuTemperature: 35.2,
    os: "Linux (CentOS 7)",
    lastPingTime: new Date(),
  },
  "srv-1203": {
    serverId: "SRV-1203",
    rack: "D5",
    slot: 8,
    powerDraw: 280,
    computeUtilization: 0.0,
    memoryUtilization: 0,
    networkBandwidth: 0,
    dailyCost: 23.3,
    uptime: "112d 3h",
    flagged: true,
    detectedAt: new Date(),
    resolvedAt: null,
    powerPerComputeUnit: Infinity,
    idleScore: 0.92,
    isDuplicate: true,
    severity: "critical",
    recommendation: "Decommission immediately. Identical profile to primary server. Save RM 8,500/year.",
    cpuTemperature: 29.8,
    os: "Windows Server 2016",
    lastPingTime: new Date(),
  },
  "srv-0391": {
    serverId: "SRV-0391",
    rack: "A1",
    slot: 22,
    powerDraw: 410,
    computeUtilization: 0.5,
    memoryUtilization: 5,
    networkBandwidth: 50,
    dailyCost: 34.2,
    uptime: "8d 19h",
    flagged: true,
    detectedAt: new Date(),
    resolvedAt: null,
    powerPerComputeUnit: 820,
    idleScore: 0.68,
    isDuplicate: false,
    severity: "medium",
    recommendation: "Review scheduled maintenance windows. Potential RM 12,491/year savings.",
    cpuTemperature: 42.1,
    os: "Ubuntu 20.04",
    lastPingTime: new Date(),
  },
};

// ============================================================================
// 4. THERMAL REGRETS COLLECTION
// ============================================================================
export const thermalRegretsData = {
  "regret-001": {
    rack: "C3",
    timestamp: new Date(Date.now() - 2 * 3600000),
    regretAmount: 214,
    currency: "RM",
    reason: "Over-cooled by 4°C during low-load period",
    optimalAction: "Reduce fan speed to 60%, save 2.1 kWh",
    estimatedSavings: 2.1,
    coolingMode: "full-load",
    ambientTemp: 26.5,
    setpointTemp: 22,
    actualTemp: 20.2,
    energyWasted: 8.4, // kWh
  },
  "regret-002": {
    rack: "A7",
    timestamp: new Date(Date.now() - 3 * 3600000),
    regretAmount: 89,
    currency: "RM",
    reason: "Cooling maintained during ambient drop",
    optimalAction: "Switch to free cooling mode for 47 minutes",
    estimatedSavings: 3.5,
    coolingMode: "chiller",
    ambientTemp: 24.2,
    setpointTemp: 22,
    actualTemp: 22.1,
    energyWasted: 2.3,
  },
  "regret-003": {
    rack: "B2",
    timestamp: new Date(Date.now() - 4 * 3600000),
    regretAmount: 156,
    currency: "RM",
    reason: "Redundant cooling loop active on idle servers",
    optimalAction: "Disable secondary loop, redirect to hot aisle",
    estimatedSavings: 1.8,
    coolingMode: "dual-loop",
    ambientTemp: 25.8,
    setpointTemp: 22,
    actualTemp: 21.5,
    energyWasted: 4.2,
  },
};

// ============================================================================
// 5. WORKLOAD FORECASTS COLLECTION
// ============================================================================
export const workloadForecastsData = {
  "forecast-001": {
    forecastId: "FORECAST-20260417-001",
    forecastType: "surge",
    severity: "high",
    message: "Compute surge forming in Rack B7 in 18 minutes",
    recommendedAction: "Pre-cool now — increase fan to 85%",
    eta: 18,
    timestamp: new Date(),
    affectedRacks: ["B7", "B8"],
    predictedPowerIncrease: 2500,
    confidence: 0.92,
    source: "ml-predictor",
  },
  "forecast-002": {
    forecastId: "FORECAST-20260417-002",
    forecastType: "thermal",
    severity: "medium",
    message: "Outdoor ambient will rise +3°C by 5:00 AM",
    recommendedAction: "Schedule free cooling window before 4:30 AM",
    eta: 142,
    timestamp: new Date(),
    affectedRacks: ["A1", "A2", "A3", "C5", "C6"],
    predictedTempRise: 3.0,
    confidence: 0.85,
    source: "weather-api",
  },
  "forecast-003": {
    forecastId: "FORECAST-20260417-003",
    forecastType: "green",
    severity: "low",
    message: "Green energy window opening at 6:15 AM (solar grid)",
    recommendedAction: "Queue batch jobs for green window",
    eta: 255,
    timestamp: new Date(),
    affectedRacks: ["all"],
    greenEnergyPercentage: 65,
    confidence: 0.78,
    source: "energy-grid-api",
  },
};

// ============================================================================
// 6. ENERGY GENOME WORKLOADS COLLECTION
// ============================================================================
export const energyGenomesData = {
  "wl-alpha": {
    workloadId: "WL-Alpha",
    workloadType: "ML Training",
    powerPhases: [0.2, 0.8, 1.0, 0.9, 0.6, 0.3, 0.1],
    averagePower: 4200,
    relatedWorkloadId: "WL-Gamma",
    createdAt: new Date(),
    lastSeen: new Date(),
    frequency: "daily",
    averageDuration: 480, // minutes
    peakPower: 5500,
    metadata: {
      framework: "TensorFlow",
      dataSize: "450GB",
      gpuType: "A100",
      estimatedCost: 125.5,
    },
  },
  "wl-beta": {
    workloadId: "WL-Beta",
    workloadType: "Data Pipeline",
    powerPhases: [0.1, 0.3, 0.5, 0.5, 0.4, 0.2, 0.1],
    averagePower: 1800,
    relatedWorkloadId: "WL-Delta",
    createdAt: new Date(),
    lastSeen: new Date(),
    frequency: "hourly",
    averageDuration: 45,
    peakPower: 2100,
    metadata: {
      tool: "Apache Spark",
      dataSize: "120GB",
      nodes: 8,
      estimatedCost: 23.4,
    },
  },
  "wl-gamma": {
    workloadId: "WL-Gamma",
    workloadType: "Batch Render",
    powerPhases: [0.1, 0.2, 0.3, 0.9, 1.0, 0.7, 0.2],
    averagePower: 3900,
    relatedWorkloadId: "WL-Alpha",
    createdAt: new Date(),
    lastSeen: new Date(),
    frequency: "daily",
    averageDuration: 360,
    peakPower: 4800,
    metadata: {
      software: "3DS Max",
      rendering: "V-Ray",
      outputFrames: 2400,
      estimatedCost: 98.7,
    },
  },
  "wl-delta": {
    workloadId: "WL-Delta",
    workloadType: "ETL Job",
    powerPhases: [0.1, 0.4, 0.6, 0.5, 0.3, 0.2, 0.1],
    averagePower: 1650,
    relatedWorkloadId: "WL-Beta",
    createdAt: new Date(),
    lastSeen: new Date(),
    frequency: "4/day",
    averageDuration: 90,
    peakPower: 1950,
    metadata: {
      database: "PostgreSQL",
      etlTool: "Talend",
      recordsProcessed: 15000000,
      estimatedCost: 19.8,
    },
  },
  "wl-epsilon": {
    workloadId: "WL-Epsilon",
    workloadType: "API Server",
    powerPhases: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
    averagePower: 2200,
    relatedWorkloadId: null,
    createdAt: new Date(),
    lastSeen: new Date(),
    frequency: "continuous",
    averageDuration: null,
    peakPower: 2800,
    metadata: {
      framework: "Node.js",
      endpoints: 45,
      requestsPerDay: 8500000,
      estimatedCost: 45.3,
    },
  },
};

// ============================================================================
// 7. ENERGY METRICS COLLECTION
// ============================================================================
export const energyMetricsData = {
  "metric-hourly-20260417": {
    timestamp: new Date(),
    totalPowerConsumption: 52340,
    averageCoolingCost: 1250.5,
    carbonEmissions: 18.5, // kg CO2
    efficiencyScore: 78.2,
    topAlert: "Vampire Server Detected",
    period: "hourly",
    datacenter: "DC-KL-01",
    peakLoad: 94.2,
    averageLoad: 72.5,
    coolingEfficiency: 0.82,
    pue: 1.45, // Power Usage Effectiveness
    metrics: {
      racksOnline: 28,
      serversActive: 245,
      serversPoweredOff: 12,
      uptime: 99.98,
    },
  },
  "metric-daily-20260416": {
    timestamp: new Date(Date.now() - 86400000),
    totalPowerConsumption: 1152840,
    averageCoolingCost: 28450,
    carbonEmissions: 442.5,
    efficiencyScore: 79.1,
    topAlert: "Ambient Temperature Rise",
    period: "daily",
    datacenter: "DC-KL-01",
    peakLoad: 97.3,
    averageLoad: 68.4,
    coolingEfficiency: 0.84,
    pue: 1.42,
    metrics: {
      racksOnline: 29,
      serversActive: 251,
      serversPoweredOff: 6,
      uptime: 99.99,
    },
  },
};

// ============================================================================
// 8. ALERTS & INCIDENTS COLLECTION
// ============================================================================
export const alertsData = {
  "alert-001": {
    alertId: "ALERT-20260417-001",
    severity: "critical",
    type: "VampireServer",
    title: "Critical Vampire Server Detected",
    description: "Server SRV-1203 consuming 280W with 0% compute utilization",
    affectedResource: "SRV-1203",
    affectedRack: "D5",
    timestamp: new Date(),
    createdAt: new Date(),
    resolvedAt: null,
    status: "open",
    estimatedCost: 23.3,
    recommendedAction: "Decommission server immediately",
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  "alert-002": {
    alertId: "ALERT-20260417-002",
    severity: "high",
    type: "ThermalRegret",
    title: "Thermal Regret Detected",
    description: "Rack C3 over-cooled by 4°C, wasting RM 214",
    affectedResource: "C3",
    affectedRack: "C3",
    timestamp: new Date(Date.now() - 7200000),
    createdAt: new Date(Date.now() - 7200000),
    resolvedAt: null,
    status: "open",
    estimatedCost: 214,
    recommendedAction: "Reduce fan speed to 60%",
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
};

// ============================================================================
// 9. AUDIT LOG COLLECTION
// ============================================================================
export const auditLogsData = {
  "log-001": {
    timestamp: new Date(),
    action: "ALERT_CREATED",
    userId: "system",
    resourceType: "VampireServer",
    resourceId: "SRV-1203",
    details: {
      serverId: "SRV-1203",
      severity: "critical",
      idleScore: 0.92,
    },
    ip: "127.0.0.1",
    userAgent: "Cloud-Function",
  },
  "log-002": {
    timestamp: new Date(Date.now() - 3600000),
    action: "FORECAST_GENERATED",
    userId: "ml-predictor",
    resourceType: "WorkloadForecast",
    resourceId: "FORECAST-20260417-001",
    details: {
      forecastType: "surge",
      affectedRacks: 2,
      confidence: 0.92,
    },
    ip: "127.0.0.1",
    userAgent: "ML-Pipeline",
  },
};

// ============================================================================
// 10. USER PREFERENCES COLLECTION
// ============================================================================
export const userPreferencesData = {
  "user-admin-001": {
    userId: "admin-001",
    email: "admin@nexusop.local",
    preferences: {
      theme: "dark",
      timezone: "Asia/Kuala_Lumpur",
      currency: "RM",
      notificationChannels: ["email", "dashboard"],
      alertThresholds: {
        vampireIdleScore: 0.75,
        thermalRegret: 100,
        temperatureWarn: 26,
      },
      defaultView: "dashboard",
      refreshInterval: 30, // seconds
    },
    role: "admin",
    createdAt: new Date(),
    lastLogin: new Date(),
  },
};

export default {
  organizationsData,
  racksData,
  vampireServersData,
  thermalRegretsData,
  workloadForecastsData,
  energyGenomesData,
  energyMetricsData,
  alertsData,
  auditLogsData,
  userPreferencesData,
};
