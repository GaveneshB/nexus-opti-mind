# Energy Genome Map Integration Guide

## Overview

The Energy Genome Map is an advanced dashboard component that visualizes workload power consumption patterns across your datacenter. This module provides complete API integration, key management, and system glue for seamless operation.

## API Key Setup

### 1. Environment Configuration

Create or update your `.env` file with the following variables:

```env
# Energy Genome API Configuration
VITE_ENERGY_GENOME_API_URL=http://localhost:3000/api
VITE_ENERGY_GENOME_API_KEY=your-api-key-here

# System Integration
VITE_DATACENTER_ID=dc-nexus-1
VITE_ENVIRONMENT=development
```

### 2. Development vs Production

- **Development**: Uses mock data if API is unavailable
- **Production**: Requires valid API credentials

## Component Usage

### Basic Usage

```tsx
import EnergyGenomeMap from '@/components/EnergyGenomeMap';

function Dashboard() {
  return <EnergyGenomeMap />;
}
```

### With Custom Query Options

```tsx
import { useEnergyGenomeWorkloads } from '@/hooks/useEnergyGenome';

function CustomEnergyView() {
  const { data: workloads, isLoading, error } = useEnergyGenomeWorkloads();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {workloads?.map(wl => (
        <div key={wl.id}>{wl.type} - {wl.avgPower}W</div>
      ))}
    </div>
  );
}
```

## API Service

The `energyGenomeApi` service provides the following methods:

### `getWorkloads()`
Fetch all energy genome workloads.

```typescript
const workloads = await energyGenomeApi.getWorkloads();
```

### `getWorkload(id: string)`
Fetch a specific workload by ID.

```typescript
const workload = await energyGenomeApi.getWorkload('WL-Alpha');
```

### `getEnergyGenome()`
Fetch complete energy genome data with aggregates.

```typescript
const genomeData = await energyGenomeApi.getEnergyGenome();
```

### `getWorkloadsFiltered(options?)`
Fetch workloads with filters and sorting.

```typescript
const filtered = await energyGenomeApi.getWorkloadsFiltered({
  type: 'ML Training',
  status: 'running',
  sortBy: 'power',
  limit: 10
});
```

### `matchWorkloads(workloadId: string)`
Find workloads with similar energy profiles.

```typescript
const matches = await energyGenomeApi.matchWorkloads('WL-Alpha');
```

## Available Hooks

### `useEnergyGenomeWorkloads()`
Query all workloads with caching.

```typescript
const { data, isLoading, error, isRefetching } = useEnergyGenomeWorkloads();
```

### `useEnergyGenome()`
Query complete energy genome data.

```typescript
const { data, isLoading, error } = useEnergyGenome();
```

### `useEnergyGenomeWorkload(id: string)`
Query a specific workload.

```typescript
const { data: workload } = useEnergyGenomeWorkload('WL-Alpha');
```

### `useEnergyGenomeWorkloadsFiltered(options?)`
Query with filtering options.

```typescript
const { data: filtered } = useEnergyGenomeWorkloadsFiltered({
  type: 'ML Training'
});
```

### `useEnergyGenomeMatches(workloadId: string)`
Query for workload matches.

```typescript
const { data: matches } = useEnergyGenomeMatches('WL-Alpha');
```

## System Integration

### Event Bus Integration

Subscribe to integration events for cross-component communication:

```typescript
import { SystemIntegration } from '@/lib/systemIntegration';

// Subscribe to Energy Genome updates
const unsubscribe = SystemIntegration.subscribe('EnergyGenomeMap', (event) => {
  console.log('Integration event:', event);
});

// Subscribe to all events
const unsubscribeAll = SystemIntegration.subscribeToAll((event) => {
  console.log('Any component event:', event);
});

// Cleanup
unsubscribe();
unsubscribeAll();
```

### Emitting Integration Events

```typescript
// Emit update
SystemIntegration.emitUpdate(
  'EnergyGenomeMap',
  'Workloads updated',
  { count: 5, totalPower: 10000 }
);

// Emit error
SystemIntegration.emitError(
  'EnergyGenomeMap',
  'Failed to fetch data',
  { statusCode: 500 }
);

// Emit warning
SystemIntegration.emitWarning(
  'EnergyGenomeMap',
  'High memory usage detected',
  { memory: '8GB' }
);
```

### Contextual Data Integration

Get energy genome data with related component context:

```typescript
const contextData = SystemIntegration.getContextualData(
  workload,
  vampireServers,
  thermalData
);
```

## Configuration & Validation

### Initialize System

```typescript
import { initializeEnergyGenome } from '@/lib/api/config';

// At app startup
const init = initializeEnergyGenome();
console.log('Energy Genome initialized:', init);
```

### Validate Configuration

```typescript
import { SystemIntegration } from '@/lib/systemIntegration';

const validation = SystemIntegration.validateConfiguration();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Data Types

### `GenomeWorkload`

```typescript
interface GenomeWorkload {
  id: string;
  type: string;
  phases: number[]; // Array of phase intensities (0-1)
  avgPower: number; // Average power in watts
  peakPower?: number;
  match?: string | null; // Twin workload ID
  startTime?: string;
  endTime?: string;
  status?: "running" | "scheduled" | "completed" | "idle";
  efficiency?: number; // 0-100 percentage
  costPerHour?: number;
}
```

### `EnergyGenomeData`

```typescript
interface EnergyGenomeData {
  workloads: GenomeWorkload[];
  timestamp: string;
  datacenterId: string;
  totalPower: number;
  averageEfficiency: number;
}
```

## Error Handling

The component automatically handles errors gracefully:

1. **API Errors**: Falls back to mock data
2. **Network Errors**: Shows error state with retry capability
3. **Configuration Errors**: Warns in development, uses fallback data

```tsx
// Error state is handled within the component
<EnergyGenomeMap />
// Shows error banner if API fails, automatically falls back to mock data
```

## Cache Strategy

- **Default cache time**: 5 minutes
- **Stale time**: 30 seconds (refetch in background if older)
- **Retry attempts**: 2
- **Retry backoff**: Exponential (1s, 2s, 4s...)

## Related Components

- **VampireDetector** - Detect low-efficiency workloads
- **ThermalRegretEngine** - Thermal optimization insights
- **CarbonDebtClock** - Environmental impact tracking
- **WorkloadForecast** - Predictive workload analysis

## Troubleshooting

### API Connection Issues

```typescript
// Check configuration
import { energyGenomeConfig } from '@/lib/api/config';

const isConfigured = energyGenomeConfig.isConfigured();
const errors = energyGenomeConfig.getValidationErrors();
console.log('Configuration valid:', isConfigured, 'Errors:', errors);
```

### Component Not Updating

Ensure TanStack Query is properly initialized in your App:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Mock Data vs Real Data

Check the component output:
- Yellow banner: Using mock/fallback data
- No banner: Using real API data
- Red banner + yellow: Error occurred, fell back to mock data

## Development

To test locally with mock data:

1. Leave `VITE_ENERGY_GENOME_API_KEY` empty
2. Component will automatically use fallback data
3. Integration events will still work normally
