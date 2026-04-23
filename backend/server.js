const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const thermalRegrets = [
  { rack: "C3", time: "9:14 PM", regret: 214, currency: "RM", reason: "Over-cooled by 4°C during low-load period", optimal: "Reduce fan speed to 60%, save 2.1 kWh" },
  { rack: "A7", time: "10:42 PM", regret: 89, currency: "RM", reason: "Cooling maintained during ambient drop", optimal: "Switch to free cooling mode for 47 minutes" },
  { rack: "B2", time: "11:05 PM", regret: 156, currency: "RM", reason: "Redundant cooling loop active on idle servers", optimal: "Disable secondary loop, redirect to hot aisle" },
  { rack: "D1", time: "1:30 AM", regret: 312, currency: "RM", reason: "Peak cooling applied during off-peak pricing", optimal: "Pre-cool during cheaper window at 11 PM" },
  { rack: "E5", time: "2:18 AM", regret: 67, currency: "RM", reason: "Fan speed mismatch with thermal load", optimal: "Dynamic fan curve adjustment per rack sensor" },
];

const forecasts = [
  { type: "surge", severity: "high", message: "Compute surge forming in Rack B7 in 18 minutes", action: "Pre-cool now — increase fan to 85%", eta: 18 },
  { type: "thermal", severity: "medium", message: "Outdoor ambient will rise +3°C by 5:00 AM", action: "Schedule free cooling window before 4:30 AM", eta: 142 },
  { type: "green", severity: "low", message: "Green energy window opening at 6:15 AM (solar grid)", action: "Queue batch jobs for green window", eta: 255 },
  { type: "surge", severity: "high", message: "Memory pressure building across Cluster 2", action: "Migrate 2 workloads to Cluster 4 standby", eta: 31 },
];

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NexusOps Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/thermal-regrets',
      'GET /api/workload-forecasts',
      'GET /api/dashboard'
    ]
  });
});

// Routes
app.get('/api/thermal-regrets', (req, res) => {
  res.json(thermalRegrets);
});

app.get('/api/workload-forecasts', (req, res) => {
  res.json(forecasts);
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    thermalRegrets,
    forecasts,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});