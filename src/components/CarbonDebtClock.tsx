import { useState, useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Leaf, TrendingUp, ArrowRight, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGeminiEnergyAnalysis } from "@/hooks/useGeminiEnergyAnalysis";
import { carbonStore } from "@/lib/carbonStore";
import { genomeWorkloads } from "@/lib/mockData";

const CarbonDebtClock = () => {
  const storeState = useSyncExternalStore(carbonStore.subscribe, carbonStore.getSnapshot);
  const debt = storeState.debt;
  const ratePerMin = storeState.ratePerMin;

  const { data: aiInsights, isLoading: loading, error: aiError } = useGeminiEnergyAnalysis(genomeWorkloads);
  const [migrations, setMigrations] = useState<{id: string; workload: string; from: string; to: string; savings: string; savingsNum: number; eta: string}[]>([]);

  const handleAcceptMigration = (id: string, savingsNum: number) => {
      // Apply payment to the global debt store mathematically
      carbonStore.applySavings(savingsNum);
      
      // We also slightly improve the grid mix globally to represent standardizing greener infrastructure 
      carbonStore.improveGridMix(storeState.gridMix.renewable + 0.05);
      
      // Remove it from the active UI
      setMigrations((prev) => prev.filter(m => m.id !== id));
  };

  useEffect(() => {
    if (aiInsights?.migrations) {
      setMigrations(aiInsights.migrations);
    } else if (aiError) {
      // Fallback to simulation data if AI is truly exhausted
      setMigrations([
        { id: "1", workload: "WL-Gamma", from: "Johor Grid", to: "Sabah Green", savings: "12.4 kg", savingsNum: 12.4, eta: "6:00 AM" },
        { id: "2", workload: "WL-Alpha", from: "Johor Grid", to: "Sabah Green", savings: "8.7 kg", savingsNum: 8.7, eta: "6:15 AM" },
        { id: "3", workload: "WL-Epsilon", from: "Selangor Grid", to: "Sabah Green", savings: "15.2 kg", savingsNum: 15.2, eta: "6:30 AM" },
      ]);
    }
  }, [aiInsights, aiError]);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-3d-accent">
          <Leaf className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex items-center justify-between w-full">
            <h2 className="font-heading font-semibold text-foreground">Carbon Debt Clock</h2>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : aiError ? (
                <div className="flex items-center gap-1 bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full" title="Using Fallback Data (API Key invalid or rate limited)">
                    <AlertCircle className="h-3 w-3" />
                    <span>Mock Data</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full" title="Generated Live via Gemini 1.5 Flash">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Generated</span>
                </div>
            )}
        </div>
      </div>

      <div className="text-center py-5 mb-4 glass rounded-xl glow-accent">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Live CO₂ Debt Today</p>
        <motion.p
          className="font-mono text-4xl font-bold text-accent text-glow-accent"
          key={Math.floor(debt)}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3 }}
        >
          {debt.toFixed(3)}
          <span className="text-lg text-accent/70 ml-2">kg</span>
        </motion.p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <TrendingUp className="h-3 w-3 text-destructive" strokeWidth={1.5} />
          <span className="text-xs text-destructive">+{ratePerMin.toFixed(2)} kg/min</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          {loading ? "Optimizing Layout..." : "AI Recommended Migrations"}
        </p>
        <div className="space-y-2">
          {migrations.map((m, i) => (
            <motion.div
              key={`${m.workload}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-between glass rounded-lg p-2.5"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-foreground">{m.workload}</span>
                <span className="text-muted-foreground hidden sm:inline">{m.from}</span>
                <ArrowRight className="h-3 w-3 text-accent" strokeWidth={1.5} />
                <span className="text-accent hidden sm:inline">{m.to}</span>
              </div>
              <div className="text-right whitespace-nowrap flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="font-mono text-xs text-accent">−{m.savings}</span>
                    <span className="text-[10px] text-muted-foreground">by {m.eta}</span>
                </div>
                <button 
                  onClick={() => handleAcceptMigration(m.id || Math.random().toString(), m.savingsNum)}
                  className="bg-accent/10 hover:bg-accent/20 text-accent transition-colors p-1.5 rounded-full"
                  title="Execute Migration"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarbonDebtClock;
