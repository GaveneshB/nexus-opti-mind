import { useState } from "react";
import { Database, DownloadCloud, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { seedDatabase } from "@/lib/seedDatabase";

const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    setResults([]);
    
    toast("Starting database seed process...", { 
      icon: <Loader2 className="h-4 w-4 animate-spin" /> 
    });

    const result = await seedDatabase();

    if (result.success && result.results) {
      setResults(result.results);
      toast.success("Database successfully seeded!");
    } else {
      setError(result.error || "Unknown error occurred");
      toast.error("Failed to seed database.");
    }

    setIsSeeding(false);
  };

  return (
    <div className="glass-card rounded-xl p-5 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="icon-3d-accent">
            <Database className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground text-lg">Firestore Database Provisioning</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Initialize all collections with mock data</p>
          </div>
        </div>
        
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-accent/20 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSeeding ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <DownloadCloud className="h-4 w-4 text-accent group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:text-glow-accent transition-all" />
          )}
          <span>{isSeeding ? "Seeding Data..." : "Run Seed Script"}</span>
        </button>
      </div>

      <div className="glass-strong rounded-lg p-5 min-h-[300px] flex flex-col items-center justify-center font-mono text-sm relative overflow-hidden">
        {results.length === 0 && !error && !isSeeding && (
          <div className="text-center text-muted-foreground opacity-50 flex flex-col items-center gap-3">
            <Database className="h-10 w-10 mb-2" strokeWidth={1} />
            <p>Database is waiting to be provisioned.</p>
            <p className="text-xs">This will write data to your connected Firebase Firestore.</p>
            <p className="text-xs text-warning mt-2">Note: Ensure your Firestore Security Rules allow writes!</p>
          </div>
        )}

        {isSeeding && (
          <div className="flex flex-col items-center gap-4 text-accent animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Pushing datasets to Firestore...</p>
          </div>
        )}

        {!isSeeding && results.length > 0 && (
          <div className="w-full text-left space-y-2">
            <div className="flex items-center gap-2 text-accent mb-4 border-b border-accent/20 pb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">Seeding Completed Successfully</span>
            </div>
            {results.map((res, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground pl-6 border-l border-border hover:border-accent/50 transition-colors">
                <span className="w-2 h-2 rounded-full bg-accent/50" />
                {res}
              </div>
            ))}
          </div>
        )}

        {!isSeeding && error && (
          <div className="w-full text-left text-destructive bg-destructive/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <XCircle className="h-4 w-4" />
              Upload Failed
            </div>
            <p className="opacity-80 break-all">{error}</p>
            <p className="mt-2 text-xs opacity-70">Hint: Check if your Firestore Rules allow client writes during testing via `allow write: if true;`.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSeeder;
