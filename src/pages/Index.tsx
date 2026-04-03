import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import SideNav from "@/components/SideNav";
import ThermalRegretEngine from "@/components/ThermalRegretEngine";
import CarbonDebtClock from "@/components/CarbonDebtClock";
import WorkloadForecast from "@/components/WorkloadForecast";
import VampireDetector from "@/components/VampireDetector";
import EnergyGenomeMap from "@/components/EnergyGenomeMap";

const Index = () => {
  const [active, setActive] = useState("overview");

  const renderContent = () => {
    switch (active) {
      case "regret":
        return <ThermalRegretEngine />;
      case "carbon":
        return <CarbonDebtClock />;
      case "forecast":
        return <WorkloadForecast />;
      case "vampires":
        return <VampireDetector />;
      case "genome":
        return <EnergyGenomeMap />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ThermalRegretEngine />
            <CarbonDebtClock />
            <WorkloadForecast />
            <VampireDetector />
            <EnergyGenomeMap />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <DashboardHeader />
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
