import { motion } from "framer-motion";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";
import { thermalRegrets } from "@/lib/mockData";

const ThermalRegretEngine = () => {
  const totalRegret = thermalRegrets.reduce((sum, r) => sum + r.regret, 0);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-3d-warning">
            <AlertTriangle className="h-5 w-5 text-warning" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading font-semibold text-foreground">Thermal Regret Engine</h2>
        </div>
        <div className="flex items-center gap-1 glass rounded-lg px-3 py-1.5 glow-warning">
          <DollarSign className="h-3 w-3 text-warning" />
          <span className="font-mono text-sm font-bold text-warning">RM {totalRegret}</span>
          <span className="text-xs text-warning/70 ml-1">wasted (6h)</span>
        </div>
      </div>

      <div className="space-y-3">
        {thermalRegrets.map((regret, i) => (
          <motion.div
            key={regret.rack}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-md">
                  Rack {regret.rack}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" strokeWidth={1.5} /> {regret.time}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-destructive">
                −RM {regret.regret}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{regret.reason}</p>
            <p className="text-xs text-accent">↳ {regret.optimal}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ThermalRegretEngine;
