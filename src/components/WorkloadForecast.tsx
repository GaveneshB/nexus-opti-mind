import { motion } from "framer-motion";
import { CloudLightning, Thermometer, Sun, AlertCircle } from "lucide-react";
import { forecasts } from "@/lib/mockData";

const iconMap = {
  surge: CloudLightning,
  thermal: Thermometer,
  green: Sun,
};

const severityStyles = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-warning/40 bg-warning/5",
  low: "border-accent/40 bg-accent/5",
};

const severityBadge = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-accent/20 text-accent",
};

const WorkloadForecast = () => {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <CloudLightning className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">Workload Weather Forecast</h2>
      </div>

      <div className="space-y-3">
        {forecasts.map((f, i) => {
          const Icon = iconMap[f.type as keyof typeof iconMap] || AlertCircle;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-md border p-3 ${severityStyles[f.severity as keyof typeof severityStyles]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-4 w-4 mt-0.5 ${f.severity === "high" ? "text-destructive" : f.severity === "medium" ? "text-warning" : "text-accent"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${severityBadge[f.severity as keyof typeof severityBadge]}`}>
                      T−{f.eta}min
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase ${severityBadge[f.severity as keyof typeof severityBadge]}`}>
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
