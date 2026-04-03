import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, TrendingUp, ArrowRight } from "lucide-react";

const CarbonDebtClock = () => {
  const [debt, setDebt] = useState(847.32);

  useEffect(() => {
    const interval = setInterval(() => {
      setDebt((prev) => prev + 0.003 + Math.random() * 0.005);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const migrations = [
    { workload: "ML-Train-07", from: "Johor Grid", to: "Sabah Green", savings: "12.4 kg", eta: "6:00 AM" },
    { workload: "ETL-Batch-12", from: "Johor Grid", to: "Sabah Green", savings: "8.7 kg", eta: "6:15 AM" },
    { workload: "Render-Q3", from: "Selangor Grid", to: "Sabah Green", savings: "15.2 kg", eta: "6:30 AM" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="h-5 w-5 text-accent" />
        <h2 className="font-heading font-semibold text-foreground">Carbon Debt Clock</h2>
      </div>

      <div className="text-center py-4 mb-4 rounded-lg bg-muted/30 border border-accent/20 glow-accent">
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
          <TrendingUp className="h-3 w-3 text-destructive" />
          <span className="text-xs text-destructive">+0.48 kg/min</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Recommended Migrations
        </p>
        <div className="space-y-2">
          {migrations.map((m, i) => (
            <motion.div
              key={m.workload}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-between rounded-md bg-muted/30 border border-border p-2"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-foreground">{m.workload}</span>
                <span className="text-muted-foreground">{m.from}</span>
                <ArrowRight className="h-3 w-3 text-accent" />
                <span className="text-accent">{m.to}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-accent">−{m.savings}</span>
                <span className="text-xs text-muted-foreground ml-2">by {m.eta}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarbonDebtClock;
