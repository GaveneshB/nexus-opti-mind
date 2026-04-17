/**
 * Example Usage of Energy Genome Map Integration
 * This file demonstrates how to use the Energy Genome system
 */

/**
 * Example 1: Basic Component Integration
 */
export const basicComponentExample = `
import EnergyGenomeMap from '@/components/EnergyGenomeMap';

function Dashboard() {
  return (
    <div className="space-y-4">
      <h1>Energy Dashboard</h1>
      <EnergyGenomeMap />
    </div>
  );
}
`;

/**
 * Example 2: Custom Hook Usage
 */
export const customHookExample = `
import { useEnergyGenomeWorkloads } from '@/hooks/useEnergyGenome';
import { Skeleton } from '@/components/ui/skeleton';

function EnergyStats() {
  const { data: workloads, isLoading, error } = useEnergyGenomeWorkloads();

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error) return <div>Error: {error.message}</div>;

  const totalPower = workloads?.reduce((sum, w) => sum + w.avgPower, 0) || 0;

  return (
    <div>
      <h2>Energy Stats</h2>
      <p>Total Power: {totalPower / 1000} kW</p>
      <p>Workloads: {workloads?.length || 0}</p>
    </div>
  );
}
`;

/**
 * Example 3: Cross-Component Integration
 */
export const crossComponentExample = `
import { useEnergyGenomeWorkloads } from '@/hooks/useEnergyGenome';
import { integrateWithVampireDetector } from '@/lib/componentIntegration';
import { vampireServers } from '@/lib/mockData';

function OptimizationDashboard() {
  const { data: workloads } = useEnergyGenomeWorkloads();

  const integrated = integrateWithVampireDetector(
    workloads || [],
    vampireServers
  );

  return (
    <div>
      <h3>Optimization Potential</h3>
      <p>Power Savings: {integrated.optimization.potentialPowerSavings}W</p>
      <p>Related Vampires: {integrated.relatedVampires.length}</p>
    </div>
  );
}
`;

/**
 * Example 4: System Integration Events
 */
export const systemIntegrationExample = `
import { useEffect, useState } from 'react';
import { SystemIntegration, eventBus } from '@/lib/systemIntegration';
import { DataIntegrationEvent } from '@/types/energy';

function IntegrationMonitor() {
  const [events, setEvents] = useState<DataIntegrationEvent[]>([]);

  useEffect(() => {
    // Subscribe to all events
    const unsubscribe = SystemIntegration.subscribeToAll((event) => {
      setEvents(prev => [...prev, event].slice(-10)); // Keep last 10
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      <h3>System Events</h3>
      <ul>
        {events.map((e, i) => (
          <li key={i} className={e.type}>
            [{e.component}] {e.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

/**
 * Example 5: Advanced API Usage with Filters
 */
export const advancedApiExample = `
import { useEnergyGenomeWorkloadsFiltered } from '@/hooks/useEnergyGenome';

function MLTrainingWorkloads() {
  const { data: mlWorkloads } = useEnergyGenomeWorkloadsFiltered({
    type: 'ML Training',
    status: 'running',
    sortBy: 'power',
    limit: 5
  });

  return (
    <div>
      <h3>Top 5 ML Training Workloads</h3>
      {mlWorkloads?.map(w => (
        <div key={w.id}>
          <p>{w.id}: {w.avgPower}W ({w.efficiency}% efficient)</p>
        </div>
      ))}
    </div>
  );
}
`;

/**
 * Example 6: Error Handling and Fallback
 */
export const errorHandlingExample = `
import { useEnergyGenomeWorkloads } from '@/hooks/useEnergyGenome';
import { SystemIntegration } from '@/lib/systemIntegration';

function RobustEnergyComponent() {
  const { data: workloads, error } = useEnergyGenomeWorkloads();

  if (error) {
    SystemIntegration.emitError(
      'RobustEnergyComponent',
      'Failed to fetch workloads',
      { originalError: error.message }
    );
    
    // Component automatically falls back to mock data
    // No need to handle explicitly
  }

  return (
    <div>
      {workloads?.length || 0} workloads loaded
    </div>
  );
}
`;

/**
 * Example 7: Configuration Validation
 */
export const configurationExample = `
import { SystemIntegration } from '@/lib/systemIntegration';
import { energyGenomeConfig } from '@/lib/api/config';

function ConfigurationCheck() {
  const validation = SystemIntegration.validateConfiguration();
  const isConfigured = energyGenomeConfig.isConfigured();

  return (
    <div>
      <h3>Configuration Status</h3>
      <p>Configured: {isConfigured ? 'Yes' : 'No'}</p>
      {validation.errors.length > 0 && (
        <div>
          <p>Warnings:</p>
          <ul>
            {validation.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
`;

/**
 * Example 8: Optimization Opportunities
 */
export const optimizationExample = `
import { useEnergyGenomeWorkloads } from '@/hooks/useEnergyGenome';
import { detectOptimizationOpportunities } from '@/lib/componentIntegration';
import { vampireServers, thermalRegrets } from '@/lib/mockData';

function OptimizationRecommendations() {
  const { data: workloads } = useEnergyGenomeWorkloads();

  const opportunities = detectOptimizationOpportunities(
    workloads || [],
    vampireServers,
    thermalRegrets
  );

  return (
    <div>
      <h3>Optimization Opportunities</h3>
      {opportunities.map(opp => (
        <div key={opp.id} className={opp.priority}>
          <p><strong>{opp.title}</strong></p>
          <p>{opp.description}</p>
          <p>Potential savings: {opp.impact}W</p>
        </div>
      ))}
    </div>
  );
}
`;
