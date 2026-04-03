import { motion } from "framer-motion";
import { Dna, Link2 } from "lucide-react";
import { genomeWorkloads } from "@/lib/mockData";

const phaseLabels = ["Spin-up", "Ramp", "Peak", "Sustain", "Cool", "Idle", "Teardown"];

const EnergyGenomeMap = () => {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-3d-primary">
          <Dna className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading font-semibold text-foreground">Energy Genome Map</h2>
      </div>

      <div className="space-y-3">
        {genomeWorkloads.map((wl, i) => (
          <motion.div
            key={wl.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{wl.id}</span>
                <span className="text-xs text-muted-foreground">{wl.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{wl.avgPower}W avg</span>
                {wl.match && (
                  <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                    <Link2 className="h-3 w-3" strokeWidth={1.5} /> Twin: {wl.match}
                  </span>
                )}
              </div>
            </div>

            {/* DNA bar */}
            <div className="flex gap-1">
              {wl.phases.map((intensity, j) => (
                <div key={j} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md"
                    style={{
                      height: `${intensity * 32}px`,
                      background: `linear-gradient(180deg, hsl(${190 - intensity * 150} ${60 + intensity * 40}% ${50 + intensity * 15}% / 0.8), hsl(${190 - intensity * 150} ${60 + intensity * 40}% ${30 + intensity * 10}% / 0.6))`,
                      boxShadow: `0 2px 8px hsl(${190 - intensity * 150} ${60 + intensity * 40}% ${40 + intensity * 20}% / 0.3)`,
                    }}
                  />
                  <span className="text-[8px] text-muted-foreground">{phaseLabels[j]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EnergyGenomeMap;
