import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, TrendingUp, TrendingDown, ArrowRight, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGeminiEnergyAnalysis } from "@/hooks/useGeminiEnergyAnalysis";
import { carbonStore } from "@/lib/carbonStore";
import { genomeWorkloads } from "@/lib/mockData";

const CarbonDebtClock = () => {
  const queryClient = useQueryClient();
  const storeState = useSyncExternalStore(carbonStore.subscribe, carbonStore.getSnapshot);
  const debt = storeState.debt;
  const ratePerMin = storeState.ratePerMin;
  const prevDebtRef = useRef(debt);

  const { data: aiInsights, isLoading: loading, error: aiError } = useGeminiEnergyAnalysis(storeState.workloads);
  const [migrations, setMigrations] = useState<{id: string; workload: string; from: string; to: string; savings: string; savingsNum: number; eta: string}[]>([]);
  const [executedIds, setExecutedIds] = useState<Set<string>>(new Set());
  const [showSavingsFlash, setShowSavingsFlash] = useState<{amount: number} | null>(null);

  const handleAcceptMigration = (workloadId: string, targetGrid: string, savingsNum: number, migrationId: string) => {
      // Prevent double-execution
      if (executedIds.has(migrationId)) return;
      
      // Record the debt BEFORE migration
      const debtBefore = storeState.debt;
      
      // Execute the migration — this reduces debt and recalculates tick rate
      carbonStore.migrateWorkload(workloadId, targetGrid, savingsNum);
      
      // Track executed migration
      setExecutedIds(prev => new Set(prev).add(migrationId));
      
      // Optimistic removal: immediately hide this card
      setMigrations((prev) => prev.filter(m => m.id !== migrationId));
      
      // Show savings flash animation
      setShowSavingsFlash({ amount: savingsNum });
      setTimeout(() => setShowSavingsFlash(null), 2500);
      
      // Improve grid mix slightly per migration
      carbonStore.improveGridMix(storeState.gridMix.renewable + 0.05);
      
      // Invalidate the AI query cache so it fetches fresh suggestions
      // Use a small delay to let the store state propagate
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["gemini-energy-analysis"] });
      }, 100);
  };

  useEffect(() => {
    if (aiInsights?.migrations) {
      // Filter out any recommendations for already-migrated workloads AND already-executed migrations
      const migratedIds = new Set(storeState.workloads.filter(w => w.status === "migrated").map(w => w.id));
      const freshMigrations = aiInsights.migrations.filter(m => 
        !migratedIds.has(m.workload) && !executedIds.has(m.id)
      );
      setMigrations(freshMigrations);
    } else if (aiError) {
      // Fallback: only suggest non-migrated workloads
      const migratedIds = new Set(storeState.workloads.filter(w => w.status === "migrated").map(w => w.id));
      const allFallback = [
        { id: "fb-1", workload: "WL-Alpha", from: "Johor Grid", to: "Sabah Green", savings: "12.4 kg", savingsNum: 12.4, eta: "6:00 AM" },
        { id: "fb-2", workload: "WL-Gamma", from: "Johor Grid", to: "Sabah Green", savings: "8.7 kg", savingsNum: 8.7, eta: "6:15 AM" },
        { id: "fb-3", workload: "WL-Epsilon", from: "Selangor Grid", to: "Hydro-Node-A", savings: "15.2 kg", savingsNum: 15.2, eta: "6:30 AM" },
        { id: "fb-4", workload: "WL-Beta", from: "Selangor Grid", to: "Hydro-Node-A", savings: "6.1 kg", savingsNum: 6.1, eta: "6:45 AM" },
        { id: "fb-5", workload: "WL-Delta", from: "Johor Grid", to: "Sabah Green", savings: "5.3 kg", savingsNum: 5.3, eta: "7:00 AM" },
      ];
      setMigrations(allFallback.filter(m => !migratedIds.has(m.workload) && !executedIds.has(m.id)));
    }
  }, [aiInsights, aiError, storeState.workloads, executedIds]);

  // Track if debt is decreasing (migrations are working)
  const debtDecreasing = debt < prevDebtRef.current - 0.01;
  useEffect(() => {
    prevDebtRef.current = debt;
  }, [debt]);

  const migratedCount = storeState.workloads.filter(w => w.status === "migrated").length;
  const totalWorkloads = storeState.workloads.length;

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
                <div className="flex items-center gap-1 bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full" title={`API Error: ${aiError.message}`}>
                    <AlertCircle className="h-3 w-3" />
                    <span>Using Fallback (Check .env)</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full" title="Real-time Optimizer: Groq Llama 3.1 Advanced RL">
                    <Sparkles className="h-3 w-3" />
                    <span>Groq Advanced RL</span>
                </div>
            )}
        </div>
      </div>

      <div className="text-center py-5 mb-4 glass rounded-xl glow-accent relative overflow-hidden">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Live CO₂ Sensor: DC-NEXUS-01
        </p>
        <motion.p
          className="font-mono text-4xl font-bold text-accent text-glow-accent"
          key={Math.floor(debt * 100)} // Pulse on every 0.01kg change
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.1 }}
        >
          {debt.toFixed(2)}
          <span className="text-lg text-accent/70 ml-2">kg</span>
        </motion.p>
        
        <div className="flex flex-col items-center justify-center h-8 mt-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!showSavingsFlash ? (
              <motion.div 
                key="rate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-1"
              >
                <TrendingUp className="h-3 w-3 text-destructive" strokeWidth={1.5} />
                <span className="text-xs text-destructive font-medium">+{ratePerMin.toFixed(2)} kg/min</span>
              </motion.div>
            ) : (
              <motion.div
                key="savings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20"
              >
                <TrendingDown className="h-4 w-4" />
                <span className="font-mono text-sm font-bold">SAVED −{showSavingsFlash.amount.toFixed(1)} kg</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          {loading ? "Optimizing Layout..." : migrations.length === 0 && migratedCount > 0 ? "All Migrations Complete ✓" : "AI Recommended Migrations"}
        </p>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {migrations.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.1 }}
                layout
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
                    onClick={() => handleAcceptMigration(m.workload, m.to, m.savingsNum, m.id)}
                    className="bg-accent/10 hover:bg-accent/20 text-accent transition-colors p-1.5 rounded-full"
                    title="Execute Migration"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Show completion message when all workloads are migrated */}
          {migrations.length === 0 && migratedCount > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 glass rounded-lg"
            >
              <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-green-400 font-medium">All workloads optimized!</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Saved {storeState.totalSaved.toFixed(1)} kg CO₂ • Rate reduced to {ratePerMin.toFixed(4)} kg/min
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarbonDebtClock;
