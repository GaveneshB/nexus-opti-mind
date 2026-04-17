import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, KeyRound, Play, RefreshCw, Zap } from "lucide-react";
import { GEMINI_API_KEYS, testGeminiKey, type GeminiKeyStatus } from "@/lib/gemini";
import { toast } from "sonner";

const maskKey = (key: string) => {
  if (!key) return "Missing Key";
  if (key.length < 15) return "***";
  return key.substring(0, 8) + "..." + key.substring(key.length - 4);
};

const GeminiTester = () => {
  const [statuses, setStatuses] = useState<GeminiKeyStatus[]>(
    Array.from({ length: 5 }).map((_, i) => {
      const key = GEMINI_API_KEYS[i] || "";
      return {
        index: i + 1,
        key,
        maskedKey: maskKey(key),
        status: "idle",
      };
    })
  );
  
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testKey = async (index: number) => {
    const keyData = statuses.find(s => s.index === index);
    if (!keyData || !keyData.key) {
      toast.error(`Key ${index} is missing or empty`);
      return;
    }

    setStatuses(prev => 
      prev.map(s => s.index === index ? { ...s, status: "testing", error: undefined, response: undefined, latencyMs: undefined } : s)
    );

    const result = await testGeminiKey(keyData.key);

    setStatuses(prev => 
      prev.map(s => s.index === index ? { 
        ...s, 
        status: result.ok ? "ok" : "error",
        latencyMs: result.latencyMs,
        response: result.response,
        error: result.error
      } : s)
    );

    if (result.ok) {
      toast.success(`Key ${index} is working! (${result.latencyMs}ms)`);
    } else {
      toast.error(`Key ${index} failed: ${result.error}`);
    }
  };

  const testAllKeys = async () => {
    setIsTestingAll(true);
    toast("Testing all Gemini API keys...", { icon: <RefreshCw className="h-4 w-4 animate-spin" /> });
    
    // Set all to testing that have keys
    setStatuses(prev => prev.map(s => s.key ? { ...s, status: "testing" } : s));

    const promises = statuses.map(async (s) => {
      if (!s.key) return;
      const result = await testGeminiKey(s.key);
      setStatuses(prev => 
        prev.map(curr => curr.index === s.index ? { 
          ...curr, 
          status: result.ok ? "ok" : "error",
          latencyMs: result.latencyMs,
          response: result.response,
          error: result.error
        } : curr)
      );
    });

    await Promise.all(promises);
    setIsTestingAll(false);
    
    // Calculate summary
    setStatuses(prev => {
      const active = prev.filter(s => s.key);
      const passed = prev.filter(s => s.status === "ok").length;
      if (passed === active.length && active.length > 0) {
        toast.success(`All ${passed} active keys are working perfectly!`);
      } else if (passed > 0) {
        toast.warning(`${passed}/${active.length} keys are working.`);
      } else {
        toast.error("All keys failed the connection test.");
      }
      return prev;
    });
  };

  return (
    <div className="glass-card rounded-xl p-5 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="icon-3d-primary">
            <Zap className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground text-lg">Gemini API Matrix</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Multiplexed connection pool status</p>
          </div>
        </div>
        
        <button 
          onClick={testAllKeys}
          disabled={isTestingAll || statuses.filter(s => s.key).length === 0}
          className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-primary/20 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isTestingAll ? (
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Play className="h-4 w-4 text-primary group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:text-glow-primary transition-all" />
          )}
          <span>Diagnose Pool</span>
        </button>
      </div>

      <div className="grid gap-3">
        {statuses.map((status, i) => (
          <motion.div
            key={status.index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-strong rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all border-l-2
              ${status.status === "ok" ? "border-l-accent bg-accent/5" : 
                status.status === "error" ? "border-l-destructive bg-destructive/5" : 
                status.status === "testing" ? "border-l-primary bg-primary/5" : "border-l-border"}
            `}
          >
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className={`p-2 rounded-md ${
                status.status === "ok" ? "bg-accent/20 text-accent glow-accent" : 
                status.status === "error" ? "bg-destructive/20 text-destructive glow-destructive" : 
                status.status === "testing" ? "bg-primary/20 text-primary glow-primary" : "bg-muted text-muted-foreground"
              }`}>
                <KeyRound className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">Node {status.index}</span>
                  {!status.key && (
                    <span className="text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">Empty</span>
                  )}
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  {status.maskedKey}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full md:w-auto px-2">
              {status.status === "testing" && (
                <div className="flex items-center gap-2 text-primary font-mono text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> Handshaking...
                </div>
              )}
              {status.status === "ok" && (
                <div className="flex items-center gap-2 text-accent font-mono text-xs text-glow-accent">
                  <CheckCircle2 className="h-3 w-3" /> Link Active {status.latencyMs && `<${status.latencyMs}ms>`}
                </div>
              )}
              {status.status === "error" && (
                <div className="flex flex-col gap-1 text-destructive font-mono text-xs">
                  <div className="flex items-center gap-2 text-glow-destructive">
                    <XCircle className="h-3 w-3" /> Connection Refused {status.latencyMs && `<${status.latencyMs}ms>`}
                  </div>
                  <div className="text-[10px] text-destructive/80 opacity-80 pl-5 break-all max-w-[400px]">
                    ERR: {status.error}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => testKey(status.index)}
              disabled={!status.key || status.status === "testing"}
              className={`p-2 rounded-lg transition-all
                ${!status.key || status.status === "testing" ? "opacity-30 cursor-not-allowed" : 
                  "hover:bg-primary/20 hover:text-primary text-muted-foreground border border-border hover:border-primary/50"}
              `}
              title={`Test Key ${status.index}`}
            >
              {status.status === "testing" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GeminiTester;
