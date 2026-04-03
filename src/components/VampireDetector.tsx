import { motion } from "framer-motion";
import { Ghost, DollarSign } from "lucide-react";
import { vampireServers, rackLayout } from "@/lib/mockData";

const VampireDetector = () => {
  const totalDrain = vampireServers.reduce((s, v) => s + v.dailyCost, 0);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-3d-destructive">
            <Ghost className="h-5 w-5 text-destructive" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading font-semibold text-foreground">Silent Vampire Detector</h2>
        </div>
        <div className="glass rounded-lg px-3 py-1.5 glow-destructive">
          <span className="font-mono text-sm text-destructive font-bold">RM {totalDrain.toFixed(1)}/day drain</span>
        </div>
      </div>

      {/* Rack Map */}
      <div className="grid grid-cols-6 gap-1.5 mb-4">
        {rackLayout.map((rack) => (
          <motion.div
            key={rack.id}
            className={`relative rounded-lg p-1.5 text-center ${
              rack.hasVampire
                ? "glass border-destructive/40 animate-pulse-glow shadow-[0_0_16px_hsl(340_80%_55%/0.3)]"
                : rack.load > 70
                ? "glass border-warning/20"
                : "glass"
            }`}
            whileHover={{ scale: 1.1, y: -2 }}
            title={`${rack.id}: ${rack.temp.toFixed(1)}°C | ${rack.load.toFixed(0)}% | ${rack.power.toFixed(0)}W`}
          >
            <span className={`font-mono text-[10px] ${rack.hasVampire ? "text-destructive font-bold" : "text-muted-foreground"}`}>
              {rack.id}
            </span>
            {rack.hasVampire && (
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive animate-ping shadow-[0_0_8px_hsl(340_80%_55%/0.6)]" />
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
            className="flex items-center justify-between glass rounded-lg p-2.5 border-destructive/15"
          >
            <div className="flex items-center gap-3">
              <div className="icon-3d-destructive !p-1.5">
                <Ghost className="h-3 w-3 text-destructive" strokeWidth={1.5} />
              </div>
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
                <DollarSign className="h-3 w-3" strokeWidth={1.5} />RM {v.dailyCost}/d
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VampireDetector;
