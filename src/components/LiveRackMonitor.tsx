import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertTriangle, Zap, Thermometer } from "lucide-react";
// Firebase removed - using backend API instead
// import { useRackMetrics } from "@/hooks/use-firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveRackMonitorProps {
  rackId: string;
}

/**
 * Real-time rack monitoring component connected to Firebase
 * Displays temperature, power consumption, and CPU load trends
 */
export const LiveRackMonitor = ({ rackId }: LiveRackMonitorProps) => {
  const { metrics, loading, error } = useRackMetrics(rackId, 60); // Last 60 minutes

  const stats = useMemo(() => {
    if (!metrics.length) {
      return {
        currentTemp: 0,
        avgTemp: 0,
        maxTemp: 0,
        currentPower: 0,
        avgPower: 0,
        maxPower: 0,
        currentCPU: 0,
        avgCPU: 0,
      };
    }

    const powers = metrics.map((m) => m.powerDraw);
    const temps = metrics.map((m) => m.temperature);
    const cpus = metrics.map((m) => m.cpuLoad);

    return {
      currentTemp: temps[temps.length - 1],
      avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      maxTemp: Math.max(...temps).toFixed(1),
      currentPower: powers[powers.length - 1],
      avgPower: (powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(0),
      maxPower: Math.max(...powers).toFixed(0),
      currentCPU: cpus[cpus.length - 1],
      avgCPU: (cpus.reduce((a, b) => a + b, 0) / cpus.length).toFixed(1),
    };
  }, [metrics]);

  const chartData = useMemo(() => {
    return metrics.map((m) => ({
      time: new Date(m.recordedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: m.temperature,
      power: m.powerDraw,
      cpu: m.cpuLoad,
    }));
  }, [metrics]);

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Error loading rack data: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">Current Temp</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-orange-500" />
              {loading ? "-" : `${stats.currentTemp}°C`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">Avg Temp</div>
            <div className="text-2xl font-bold">{loading ? "-" : `${stats.avgTemp}°C`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">Peak Temp</div>
            <div className="text-2xl font-bold">{loading ? "-" : `${stats.maxTemp}°C`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">Current Power</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              {loading ? "-" : `${stats.currentPower}W`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">Avg Power</div>
            <div className="text-2xl font-bold">{loading ? "-" : `${stats.avgPower}W`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1">CPU Load</div>
            <div className="text-2xl font-bold">{loading ? "-" : `${stats.avgCPU}%`}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Temperature Trend (Last 60min)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="°C" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Power Consumption (Last 60min)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="power" stroke="#eab308" strokeWidth={2} dot={false} name="Watts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Loading rack metrics...</p>
        </div>
      )}
    </div>
  );
};

export default LiveRackMonitor;
