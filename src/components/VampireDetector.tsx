import { motion } from "framer-motion";
import { Ghost, DollarSign } from "lucide-react";
import { vampireServers, rackLayout } from "@/lib/mockData";

const VampireDetector = () => {
  const totalDrain = vampireServers.reduce((s, v) => s + v.dailyCost, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-destructive" />
          <h2 className="font-heading font-semibold text-foreground">Silent Vampire Detector</h2>
        </div>
        <div className="rounded-md bg-destructive/10 px-3 py-1 glow-destructive">
          <span className="font-mono text-sm text-destructive font-bold">RM {totalDrain.toFixed(1)}/day drain</span>
        </div>
      </div>

      {/* Rack Map */}
      <div className="grid grid-cols-6 gap-1.5 mb-4">
        {rackLayout.map((rack) => (
          <motion.div
            key={rack.id}
            className={`relative rounded-sm p-1.5 text-center border ${
              rack.hasVampire
                ? "border-destructive bg-destructive/20 animate-pulse-glow"
                : rack.load > 70
                ? "border-warning/30 bg-warning/5"
                : "border-border bg-muted/20"
            }`}
            whileHover={{ scale: 1.1 }}
            title={`${rack.id}: ${rack.temp.toFixed(1)}°C | ${rack.load.toFixed(0)}% | ${rack.power.toFixed(0)}W`}
          >
            <span className={`font-mono text-[10px] ${rack.hasVampire ? "text-destructive font-bold" : "text-muted-foreground"}`}>
              {rack.id}
            </span>
            {rack.hasVampire && (
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-ping" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Vampire list */}
      <div className="space-y-2">
        {vampireServers.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-2"
          >
            <div className="flex items-center gap-3">
              <Ghost className="h-3 w-3 text-destructive" />
              <div>
                <span className="font-mono text-xs text-foreground">{v.id}</span>
                <span className="text-xs text-muted-foreground ml-2">Rack {v.rack} / Slot {v.slot}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">{v.powerDraw}W</span>
              <span className="text-muted-foreground">{v.compute}% compute</span>
              <span className="text-muted-foreground">{v.uptime}</span>
              <span className="font-mono text-destructive font-bold flex items-center gap-0.5">
                <DollarSign className="h-3 w-3" />RM {v.dailyCost}/d
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VampireDetector;
