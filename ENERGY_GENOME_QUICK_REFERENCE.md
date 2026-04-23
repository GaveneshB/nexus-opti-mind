# Energy Genome Map - Quick Reference

## Project Structure

```
src/
├── components/
│   └── EnergyGenomeMap.tsx          # Main component (API-integrated)
├── hooks/
│   └── useEnergyGenome.ts           # React Query hooks
├── lib/
│   ├── api/
│   │   ├── energyGenome.ts          # API service
│   │   └── config.ts                # Configuration management
│   ├── componentIntegration.ts      # Cross-component utilities
│   ├── systemIntegration.ts         # Event bus & integration
│   └── mockData.ts                  # Fallback data
├── types/
│   └── energy.ts                    # TypeScript interfaces
├── examples/
│   └── energyGenomeExamples.ts      # Usage examples
├── .env                             # API configuration (dev)
├── .env.example                     # Configuration template
└── ENERGY_GENOME_INTEGRATION.md    # Full documentation
```

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `EnergyGenomeMap.tsx` | Main React component with loading/error states |
| `energyGenome.ts` | API client with retry logic |
| `useEnergyGenome.ts` | React Query hooks for data fetching |
| `systemIntegration.ts` | Event bus for component communication |
| `componentIntegration.ts` | Cross-component data utilities |
| `energy.ts` | TypeScript type definitions |
| `config.ts` | Configuration validation & initialization |

## Environment Variables

```env
VITE_ENERGY_GENOME_API_URL=http://localhost:3000/api
VITE_ENERGY_GENOME_API_KEY=your-api-key
VITE_DATACENTER_ID=dc-nexus-1
VITE_ENVIRONMENT=development
```

## Quick Start

### 1. Basic Setup
```typescript
// App.tsx automatically initializes on startup
// Just use the component like normal
```

### 2. Import Component
```typescript
import EnergyGenomeMap from '@/components/EnergyGenomeMap';

<EnergyGenomeMap />
```

### 3. Use Hooks
```typescript
import { useEnergyGenomeWorkloads } from '@/hooks/useEnergyGenome';

const { data: workloads, isLoading } = useEnergyGenomeWorkloads();
```

### 4. Handle Events
```typescript
import { SystemIntegration } from '@/lib/systemIntegration';

SystemIntegration.subscribe('EnergyGenomeMap', (event) => {
  console.log('Event:', event);
});
```

## API Endpoints

Expected API provides these endpoints:

- `GET /energy-genome/workloads` - Get all workloads
- `GET /energy-genome/workloads/{id}` - Get specific workload
- `GET /energy-genome` - Get complete data with aggregates
- `GET /energy-genome/workloads?type=...&status=...` - Get filtered workloads
- `GET /energy-genome/workloads/{id}/matches` - Find similar workloads

**Authentication**: X-API-Key header

## Data Flow

```
API/Mock Data
    ↓
energyGenomeApi (service)
    ↓
useEnergyGenomeWorkloads (hook)
    ↓
EnergyGenomeMap (component)
    ↓
SystemIntegration (events) → Other components
```

## Error Handling

- ✅ Network errors → Automatic retry (2 attempts)
- ✅ API errors → Falls back to mock data
- ✅ Config errors → Warning in console, mock data enabled
- ✅ Component errors → Shows error banner with fallback data

## Caching Strategy

- **Fresh time**: 30 seconds (no refetch)
- **Stale time**: 5 minutes (background refetch)
- **Retry delay**: Exponential backoff
- **Max events in bus**: 100

## Integration Points

### With VampireDetector
```typescript
integrateWithVampireDetector(workloads, vampireServers)
// Returns power-saving opportunities
```

### With ThermalRegretEngine
```typescript
integrateWithThermalEngine(workloads, thermalRegrets)
// Maps thermal events to workloads
```

### With WorkloadForecast
```typescript
integrateWithForecast(workloads, forecasts)
// Shows impact on upcoming workload surges
```

### With CarbonDebtClock
```typescript
integrateWithCarbonClock(workloads, gridMix)
// Calculates energy-to-carbon impact
```

## Tips & Best Practices

1. **Always initialize** - App.tsx does this automatically
2. **Use hooks** - Let React Query handle caching
3. **Subscribe to events** - For loose coupling between components
4. **Handle loading states** - Component shows spinner automatically
5. **Watch for errors** - Component shows fallback data gracefully
6. **Configure .env** - Copy .env.example and update values

## Troubleshooting

**Component showing mock data?**
- Check API_KEY env variable is set
- Check API_URL is correct
- Check network connection
- Check browser console for errors

**Events not firing?**
- Ensure component is mounted
- Check subscription handler
- Verify event type matches

**API returning 401?**
- Verify API_KEY is correct
- Check key has right permissions
- Ensure X-API-Key header is being sent

**Slow queries?**
- Check cache is working (React Query DevTools)
- Verify network latency
- Check API server performance

## Support

See full documentation in: `ENERGY_GENOME_INTEGRATION.md`
