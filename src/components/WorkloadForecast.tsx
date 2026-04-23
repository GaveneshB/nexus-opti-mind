import { motion } from "framer-motion";
import { CloudLightning, Thermometer, Sun, AlertCircle } from "lucide-react";
import { useWorkloadForecasts } from "@/hooks/useApi";

const iconMap = {
  surge: CloudLightning,
  thermal: Thermometer,
  green: Sun,
};

const severityGlass = {
  high: "glass border-destructive/20 shadow-[inset_0_0_30px_hsl(340_80%_55%/0.05)]",
  medium: "glass border-warning/20 shadow-[inset_0_0_30px_hsl(38_100%_50%/0.05)]",
  low: "glass border-accent/20 shadow-[inset_0_0_30px_hsl(155_100%_50%/0.05)]",
};

const severityBadge: Record<ForecastSeverity, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-accent/20 text-accent",
};

const severityIcon: Record<ForecastSeverity, string> = {
  high: "icon-3d-destructive",
  medium: "icon-3d-warning",
  low: "icon-3d-accent",
};

const iconMap: Record<ForecastType, React.ElementType> = {
  surge: CloudLightning,
  thermal: Thermometer,
  green: Sun,
  alert: AlertCircle,
  trending: TrendingUp,
};

// ─── Forecast generator ───────────────────────────────────────────────────────

function generateForecasts(
  avgPower: number,
  vampireCount: number,
  avgScore: number,
  totalDrain: number
): Forecast[] {
  const forecasts: Forecast[] = [];

  if (vampireCount >= 2) {
    forecasts.push({
      id: "vamp-surge",
      type: "surge",
      severity: "high",
      eta: Math.max(1, Math.round(15 - vampireCount * 3)),
      message: `${vampireCount} vampire server${vampireCount > 1 ? "s" : ""} drawing ${Math.round(avgPower * 0.4)}W excess power with near-zero CPU activity. Firestore anomaly log updated.`,
      action: `Isolate RACK-0${vampireCount} and trigger automated power-cap policy immediately.`,
      confidence: Math.min(95, 60 + vampireCount * 10),
      wattImpact: vampireCount * 180,
    });
  }

  if (avgScore > 55) {
    forecasts.push({
      id: "thermal-risk",
      type: "thermal",
      severity: avgScore > 75 ? "high" : "medium",
      eta: Math.round(20 + Math.random() * 10),
      message: `Average anomaly score ${avgScore}/100 across all racks. Sustained abnormal power may cause thermal stress in 20–30 min.`,
      action: "Pre-cool affected rack zones. Reduce tick speed to ease thermal load.",
      confidence: Math.min(90, 50 + Math.round(avgScore / 5)),
      wattImpact: Math.round(avgPower * 0.15),
    });
  }

  if (totalDrain > 8) {
    forecasts.push({
      id: "cost-drain",
      type: "alert",
      severity: totalDrain > 15 ? "high" : "medium",
      eta: Math.round(5 + Math.random() * 10),
      message: `Current drain RM ${totalDrain.toFixed(1)}/day. Monthly projection: RM ${(totalDrain * 30).toFixed(0)}. Costs logged to Firestore.`,
      action: "Enable automated cost-cap at RM 12/day. Flag high-drain racks for review.",
      confidence: 98,
      wattImpact: 0,
    });
  }

  if (vampireCount === 0 && avgScore < 35) {
    forecasts.push({
      id: "green-window",
      type: "green",
      severity: "low",
      eta: Math.round(30 + Math.random() * 30),
      message: `All racks within normal baseline. Isolation Forest score ${avgScore}/100. Optimal window for batch job scheduling.`,
      action: "Schedule deferred workloads now to maximise efficiency during the green window.",
      confidence: 80,
      wattImpact: -Math.round(avgPower * 0.08),
    });
  }

  if (vampireCount === 1) {
    forecasts.push({
      id: "single-vamp",
      type: "surge",
      severity: "medium",
      eta: Math.round(10 + Math.random() * 5),
      message: `1 rack flagged in Firestore detected_vampires. Single anomalies have 40% chance of spreading to adjacent racks within 15 min.`,
      action: "Watch adjacent racks. Raise Isolation Forest sensitivity to 70%+.",
      confidence: 72,
      wattImpact: 180,
    });
  }

  if (avgPower > 320 && vampireCount === 0) {
    forecasts.push({
      id: "trending-up",
      type: "trending",
      severity: "medium",
      eta: Math.round(25 + Math.random() * 15),
      message: `Average rack power ${Math.round(avgPower)}W — ${Math.round(((avgPower - 280) / 280) * 100)}% above baseline. Workload spike predicted.`,
      action: "Pre-allocate cooling and prepare load balancer rules.",
      confidence: 65,
      wattImpact: Math.round(avgPower * 0.2),
    });
  }

  if (forecasts.length === 0) {
    forecasts.push({
      id: "stable",
      type: "green",
      severity: "low",
      eta: 60,
      message: "All server racks operating within expected parameters. No anomalies detected by Isolation Forest. Firestore in sync.",
      action: "Continue monitoring. Next scheduled analysis in 60 minutes.",
      confidence: 92,
      wattImpact: 0,
    });
  }

  return forecasts.slice(0, 4);
}

// ─── Component ────────────────────────────────────────────────────────────────

const WorkloadForecast = () => {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-3d-primary">
            <CloudLightning className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">
              Workload Weather Forecast
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              AI predictions · live anomaly state
              {firestoreConnected ? (
                <span className="flex items-center gap-0.5 text-green-500">
                  <Wifi className="h-2.5 w-2.5" /> Firestore
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-yellow-500">
                  <WifiOff className="h-2.5 w-2.5" /> local
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={refreshForecasts}
          className="glass rounded-lg p-1.5 border border-white/10 hover:border-white/20 transition-colors"
          title="Refresh forecasts"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Live state summary */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Avg power", value: `${Math.round(avgPower)}W`, icon: Zap },
          {
            label: "Vampires",
            value: vampiresLoading ? "…" : String(liveVampireCount),
            icon: AlertCircle,
          },
          { label: "Avg score", value: String(avgScore), icon: TrendingUp },
          {
            label: "Drain/day",
            value: `RM ${totalDrain.toFixed(1)}`,
            icon: Clock,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="glass rounded-lg p-2 border border-white/5"
          >
            <Icon className="h-3 w-3 text-muted-foreground mx-auto mb-1" />
            <div className="font-mono text-sm font-bold text-foreground">
              {value}
            </div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Forecast cards */}
      <div className="space-y-3">
        {forecasts.map((f, i) => {
          const Icon = iconMap[f.type as keyof typeof iconMap] || AlertCircle;
          const sev = f.severity as "high" | "medium" | "low";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-xl p-3 ${severityGlass[sev]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`${severityIcon[sev]} flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${severityBadge[sev]}`}>
                      T−{f.eta}min
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md uppercase ${severityBadge[sev]}`}>
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{f.message}</p>
                  <p className="text-xs text-primary mt-1">⚡ {f.action}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkloadForecast;