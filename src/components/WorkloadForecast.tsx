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

const severityBadge = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-accent/20 text-accent",
};

const severityIcon = {
  high: "icon-3d-destructive",
  medium: "icon-3d-warning",
  low: "icon-3d-accent",
};

const WorkloadForecast = () => {
  const { data: forecasts, isLoading, error } = useWorkloadForecasts();

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-3d-primary">
            <CloudLightning className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading font-semibold text-foreground">Workload Weather Forecast</h2>
        </div>
        <div className="space-y-3">
          <div className="glass rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-3d-destructive">
            <AlertCircle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading font-semibold text-foreground">Workload Weather Forecast</h2>
        </div>
        <p className="text-destructive text-sm">Failed to load forecast data</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-3d-primary">
          <CloudLightning className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading font-semibold text-foreground">Workload Weather Forecast</h2>
      </div>

      <div className="space-y-3">
        {forecasts?.map((f, i) => {
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