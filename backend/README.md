# Nexus Opti-Mind Backend

Simple Express.js backend server for the Nexus Opti-Mind dashboard.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

The server will run on http://localhost:3001

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/thermal-regrets` - Get thermal regret data
- `GET /api/workload-forecasts` - Get workload forecast data
- `GET /api/dashboard` - Get combined dashboard data

## Development

For development with auto-restart:
```bash
npm run dev
```

(Note: Requires nodemon to be installed)