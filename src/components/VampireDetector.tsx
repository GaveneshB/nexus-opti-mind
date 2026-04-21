import { Ghost } from "lucide-react";

const VampireDetector = () => {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-3d-destructive">
            <Ghost className="h-5 w-5 text-destructive" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">
              Silent Vampire Detector
            </h2>
            <p className="text-xs text-muted-foreground">Isolation Forest · 10 trees · window 64</p>
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Vampire detection system using backend API</p>
        <p className="text-xs mt-2">Connected to: <span className="text-primary font-mono">http://localhost:3001/api</span></p>
      </div>
    </div>
  );
};

export default VampireDetector;
