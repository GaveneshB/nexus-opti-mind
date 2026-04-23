import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import SideNav from "@/components/SideNav";
import ThermalRegretEngine from "@/components/ThermalRegretEngine";
import CarbonDebtClock from "@/components/CarbonDebtClock";
import WorkloadForecast from "@/components/WorkloadForecast";
import VampireDetector from "@/components/VampireDetector";
import EnergyGenomeMap from "@/components/EnergyGenomeMap";

interface ComponentError {
  component: string;
  error: string;
}

// Safe Component Wrapper
const SafeComponent = ({
  component: Component,
  name,
  onError,
}: {
  component: any;
  name: string;
  onError: (error: ComponentError) => void;
}) => {
  try {
    return <Component />;
  } catch (error) {
    console.error(`${name} render error:`, error);
    onError({
      component: name,
      error: error instanceof Error ? error.message : String(error),
    });
    return (
      <div className="glass-card rounded-xl p-5 bg-destructive/5 border border-destructive/20">
        <p className="text-destructive text-sm">⚠️ {name} failed to load</p>
      </div>
    );
  }
};

const Index = () => {
  const [active, setActive] = useState("overview");
  const [componentErrors, setComponentErrors] = useState<ComponentError[]>([]);

  const handleComponentError = (error: ComponentError) => {
    setComponentErrors((prev) => [
      ...prev.filter((e) => e.component !== error.component),
      error,
    ]);
  };

  const renderContent = () => {
    switch (active) {
      case "regret":
        return (
          <SafeComponent
            component={ThermalRegretEngine}
            name="Thermal Regret Engine"
            onError={handleComponentError}
          />
        );
      case "carbon":
        return (
          <SafeComponent
            component={CarbonDebtClock}
            name="Carbon Debt Clock"
            onError={handleComponentError}
          />
        );
      case "forecast":
        return (
          <SafeComponent
            component={WorkloadForecast}
            name="Workload Forecast"
            onError={handleComponentError}
          />
        );
      case "vampires":
        return (
          <SafeComponent
            component={VampireDetector}
            name="Vampire Detector"
            onError={handleComponentError}
          />
        );
      case "genome":
        return (
          <SafeComponent
            component={EnergyGenomeMap}
            name="Energy Genome Map"
            onError={handleComponentError}
          />
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SafeComponent
              component={ThermalRegretEngine}
              name="Thermal Regret Engine"
              onError={handleComponentError}
            />
            <SafeComponent
              component={CarbonDebtClock}
              name="Carbon Debt Clock"
              onError={handleComponentError}
            />
            <SafeComponent
              component={WorkloadForecast}
              name="Workload Forecast"
              onError={handleComponentError}
            />
            <SafeComponent
              component={VampireDetector}
              name="Vampire Detector"
              onError={handleComponentError}
            />
            <SafeComponent
              component={EnergyGenomeMap}
              name="Energy Genome Map"
              onError={handleComponentError}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <DashboardHeader />
      {componentErrors.length > 0 && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-2">
          <p className="text-destructive text-xs">
            ⚠️ {componentErrors.length} component(s) failed to load. Check console for details.
          </p>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <SideNav active={active} onNavigate={setActive} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
