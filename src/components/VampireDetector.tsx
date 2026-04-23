import { motion, AnimatePresence } from "framer-motion";
import {
  Ghost,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useVampireDetector } from "@/hooks/useVampireDetector";

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({
  data,
  isVampire,
}: {
  data: Array<{ power: number }>;
  isVampire: boolean;
}) => {
  const recent = data.slice(-20);
  if (recent.length < 2) return null;
  const max = Math.max(...recent.map((d) => d.power), 1);
  const min = Math.min(...recent.map((d) => d.power));
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = recent
    .map((d, i) => {
      const x = (i / (recent.length - 1)) * w;
      const y = h - ((d.power - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={isVampire ? "#ef4444" : "#22c55e"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
};

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ score }: { score: number }) => {
  const color = score <= 40 ? "#22c55e" : score <= 70 ? "#eab308" : "#ef4444";
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
};

const scoreColor = (s: number) =>
  s <= 40 ? "text-green-500" : s <= 70 ? "text-yellow-500" : "text-red-500";

const scoreBg = (s: number) =>
  s <= 40
    ? "bg-green-500/10 border-green-500/20"
    : s <= 70
    ? "bg-yellow-500/10 border-yellow-500/20"
    : "bg-red-500/10 border-red-500/20";

// ─── Component ────────────────────────────────────────────────────────────────
const VampireDetector = () => {
  const {
    racks,
    isRunning,
    setIsRunning,
    tickSpeed,
    setTickSpeed,
    sensitivity,
    setSensitivity,
    simulationTime,
    reset,
    vampireCount,
    totalDrain,
    avgScore,
    vampireDrain,
    firestoreConnected,
    syncError,
  } = useVampireDetector();

  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-3d-destructive">
            <Ghost className="h-5 w-5 text-destructive" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">
              Silent Vampire Detector
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              Isolation Forest · 10 trees · window 64
              {firestoreConnected ? (
                <span className="flex items-center gap-0.5 text-green-500">
                  <Wifi className="h-2.5 w-2.5" /> Firestore live
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-yellow-500">
                  <WifiOff className="h-2.5 w-2.5" /> connecting…
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {vampireCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="glass rounded-lg px-3 py-1.5 bg-red-500/10 border border-red-500/20"
              >
                <span className="font-mono text-sm text-red-500 font-bold flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {vampireCount} VAMPIRE{vampireCount > 1 ? "S" : ""}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="glass rounded-lg px-3 py-1.5 glow-destructive">
            <span className="font-mono text-sm text-destructive font-bold">
              RM {totalDrain.toFixed(1)}/day
            </span>
          </div>
        </div>
      </div>

      {/* Sync error */}
      {syncError && (
        <div className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
          Firestore sync: {syncError} — running in local mode
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tick Speed: {tickSpeed}ms
          </label>
          <Slider
            value={[tickSpeed]}
            onValueChange={([v]) => setTickSpeed(v)}
            max={2000}
            min={200}
            step={100}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Sensitivity: {sensitivity}%
          </label>
          <Slider
            value={[sensitivity]}
            onValueChange={([v]) => setSensitivity(v)}
            max={100}
            min={10}
            step={5}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Racks", value: String(racks.length), sub: "monitored", col: "text-foreground" },
          { label: "Vampires", value: String(vampireCount), sub: "flagged", col: "text-red-500" },
          { label: "Avg Score", value: String(avgScore), sub: "anomaly", col: avgScore > 50 ? "text-red-500" : "text-green-500" },
          { label: "Drain", value: `RM ${vampireDrain.toFixed(1)}`, sub: "vampire/day", col: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-lg p-2.5 text-center border border-white/5">
            <div className={`font-mono text-lg font-bold ${s.col}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
            <div className="text-[10px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Rack list */}
      <div className="space-y-2">
        {racks.map((rack) => (
          <motion.div
            key={rack.id}
            layout
            onClick={() => setSelectedRack(selectedRack === rack.id ? null : rack.id)}
            className={`relative rounded-lg px-3 py-2.5 glass border cursor-pointer ${scoreBg(rack.vampireScore)} ${
              rack.isVampire ? "shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse" : ""
            }`}
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex items-center gap-3">
              {/* ID */}
              <div className="w-16 flex-shrink-0">
                <div className="font-mono text-xs font-bold text-foreground flex items-center gap-1">
                  {rack.isVampire && <Zap className="h-3 w-3 text-red-500 flex-shrink-0" />}
                  {rack.id}
                </div>
                <div className="text-[10px] text-muted-foreground">{rack.uptime}</div>
              </div>

              {/* Power bar */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>PWR</span><span className="font-mono">{rack.power}W</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue-400/70"
                    animate={{ width: `${Math.min(100, (rack.power / 600) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* CPU bar */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>CPU</span><span className="font-mono">{rack.cpu}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-teal-400/70"
                    animate={{ width: `${rack.cpu}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Sparkline */}
              <div className="hidden sm:block flex-shrink-0">
                <Sparkline data={rack.history} isVampire={rack.isVampire} />
              </div>

              {/* Score */}
              <div className="w-20 flex-shrink-0 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">score</span>
                  <span className={`font-mono font-bold ${scoreColor(rack.vampireScore)}`}>
                    {rack.vampireScore}
                  </span>
                </div>
                <ScoreBar score={rack.vampireScore} />
              </div>

              {/* Cost */}
              <div className="w-14 text-right flex-shrink-0">
                <div className="font-mono text-xs text-muted-foreground">RM {rack.dailyCost}</div>
                <div className="text-[10px] text-muted-foreground">/day</div>
              </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
              {selectedRack === rack.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Isolation Forest verdict</div>
                      <div className={`font-mono font-bold ${scoreColor(rack.vampireScore)}`}>
                        {rack.vampireScore <= 40 ? "NORMAL IDLE" : rack.vampireScore <= 70 ? "SUSPICIOUS" : "VAMPIRE DETECTED"}
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {rack.isVampire ? "High power + near-zero CPU — anomaly confirmed" : "Power matches CPU activity baseline"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {firestoreConnected ? `Firestore: server_racks/${rack.id}` : "Local only"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Baseline vs current</div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected</span>
                          <span className="font-mono">{rack.baselinePower}W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Actual</span>
                          <span className={`font-mono ${rack.power > rack.baselinePower * 1.3 ? "text-red-400" : "text-green-400"}`}>
                            {rack.power}W
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deviation</span>
                          <span className="font-mono">
                            {rack.power > rack.baselinePower ? "+" : ""}
                            {Math.round(((rack.power - rack.baselinePower) / rack.baselinePower) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Cost analysis</div>
                      <div className="space-y-0.5">
                        {[
                          ["Daily", `RM ${rack.dailyCost}`],
                          ["Monthly", `RM ${(rack.dailyCost * 30).toFixed(1)}`],
                          ["Yearly", `RM ${(rack.dailyCost * 365).toFixed(0)}`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-muted-foreground">{k}</span>
                            <span className={`font-mono ${k === "Yearly" && rack.isVampire ? "text-red-400" : ""}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Legend + status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {[
            { c: "bg-green-500/30 border-green-500/50", l: "Normal 0–40" },
            { c: "bg-yellow-500/30 border-yellow-500/50", l: "Suspect 40–70" },
            { c: "bg-red-500/30 border-red-500/50", l: "Vampire 70–100" },
          ].map(({ c, l }) => (
            <div key={l} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded border ${c}`} />
              <span>{l}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 font-mono">
          <Activity className="h-3 w-3" />
          {Math.floor(simulationTime / 60)}:{String(simulationTime % 60).padStart(2, "0")} · click rack for details
        </div>
      </div>
    </div>
  );
};

export default VampireDetector;