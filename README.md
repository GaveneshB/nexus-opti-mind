# Nexus Opti-Mind

A data center optimization dashboard with real-time workload forecasting and thermal regret analysis.

## Features

- **Workload Weather Forecast**: Predicts compute surges, thermal events, and green energy windows
- **Thermal Regret Engine**: Identifies inefficient cooling decisions and suggests optimizations
- **Real-time Data**: Connected backend API with automatic data refresh
- **Modern UI**: Glass-morphism design with smooth animations

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```
   The backend will run on http://localhost:3001

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:8082

### API Endpoints

The backend provides the following endpoints:
- `GET /api/health` - Health check
- `GET /api/thermal-regrets` - Thermal regret data
- `GET /api/workload-forecasts` - Workload forecast data
- `GET /api/dashboard` - Combined dashboard data

## Development

- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API functions
│   └── pages/         # Page components
├── backend/           # Express.js API server
├── public/            # Static assets
└── dist/              # Build output
```
