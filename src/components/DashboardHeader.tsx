import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Thermometer, Server } from "lucide-react";

const DashboardHeader = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Server, label: "Active Servers", value: "2,847", color: "text-primary" },
    { icon: Zap, label: "Power Draw", value: "4.2 MW", color: "text-warning" },
    { icon: Thermometer, label: "Avg Temp", value: "24.7°C", color: "text-accent" },
    { icon: Activity, label: "CPU Load", value: "67.3%", color: "text-primary" },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent animate-pulse-glow" />
            <h1 className="text-xl font-bold font-heading text-foreground">
              NEXUS<span className="text-primary">OPS</span>
            </h1>
          </div>
          <span className="text-muted-foreground font-mono text-xs">
            Data Center Intelligence Platform
          </span>
        </div>

        <div className="flex items-center gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`font-mono text-sm font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
          <div className="border-l border-border pl-4">
            <p className="font-mono text-sm text-primary text-glow-primary">
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </p>
            <p className="text-xs text-muted-foreground">
              {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
