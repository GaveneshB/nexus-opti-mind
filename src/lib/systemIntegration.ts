/**
 * System Integration Layer
 * Provides utilities for cross-component communication and shared state
 */

import { DataIntegrationEvent } from "@/types/energy";

/**
 * Simple event bus for component communication
 */
class EventBus {
  private listeners: Map<string, Set<(event: DataIntegrationEvent) => void>> = new Map();
  private events: DataIntegrationEvent[] = [];
  private maxEvents = 100;

  subscribe(component: string, callback: (event: DataIntegrationEvent) => void): () => void {
    if (!this.listeners.has(component)) {
      this.listeners.set(component, new Set());
    }
    this.listeners.get(component)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(component)?.delete(callback);
    };
  }

  emit(event: DataIntegrationEvent) {
    this.events = [...this.events, event].slice(-this.maxEvents);
    const callbacks = this.listeners.get(event.component);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
    // Also emit to "all" listeners
    const allCallbacks = this.listeners.get("*");
    if (allCallbacks) {
      allCallbacks.forEach((cb) => cb(event));
    }
  }

  getEvents(component?: string): DataIntegrationEvent[] {
    if (component) {
      return this.events.filter((e) => e.component === component);
    }
    return this.events;
  }

  getLatestEvent(component: string): DataIntegrationEvent | undefined {
    const events = this.getEvents(component);
    return events[events.length - 1];
  }

  clearEvents() {
    this.events = [];
  }
}

const eventBus = new EventBus();

/**
 * Integration utilities
 */
export class SystemIntegration {
  static emitEvent(event: DataIntegrationEvent) {
    eventBus.emit({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }

  static emitUpdate(component: string, message: string, data?: Record<string, unknown>) {
    this.emitEvent({
      component,
      type: "update",
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  static emitError(component: string, message: string, data?: Record<string, unknown>) {
    console.error(`[${component}] ${message}`, data);
    this.emitEvent({
      component,
      type: "error",
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  static emitWarning(component: string, message: string, data?: Record<string, unknown>) {
    console.warn(`[${component}] ${message}`, data);
    this.emitEvent({
      component,
      type: "warning",
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  static subscribe(component: string, callback: (event: DataIntegrationEvent) => void) {
    return eventBus.subscribe(component, callback);
  }

  static subscribeToAll(callback: (event: DataIntegrationEvent) => void) {
    return eventBus.subscribe("*", callback);
  }

  static getLatestEvent(component: string) {
    return eventBus.getLatestEvent(component);
  }

  static getEvents(component?: string) {
    return eventBus.getEvents(component);
  }

  /**
   * Get energy genome data in context of other dashboard components
   */
  static getContextualData(
    workload: Record<string, unknown>,
    vampireServers?: Record<string, unknown>[],
    thermalData?: Record<string, unknown>[]
  ) {
    return {
      workload,
      affectedVampires: vampireServers?.filter(
        (v) => (v.powerDraw as number) > ((workload.avgPower as number) * 0.5)
      ) || [],
      thermalImpact: thermalData?.filter((t) => t.workload === workload.id) || [],
      integrationStatus: "ready",
    };
  }

  /**
   * Validate API key configuration
   */
  static validateConfiguration(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!import.meta.env.VITE_ENERGY_GENOME_API_KEY) {
      errors.push("VITE_ENERGY_GENOME_API_KEY is not configured");
    }

    if (!import.meta.env.VITE_ENERGY_GENOME_API_URL) {
      errors.push("VITE_ENERGY_GENOME_API_URL is not configured");
    }

    if (!import.meta.env.VITE_DATACENTER_ID) {
      errors.push("VITE_DATACENTER_ID is not configured");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export event bus for advanced use cases
export { eventBus };
