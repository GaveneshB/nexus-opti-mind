import React, { useEffect, ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeEnergyGenome } from "@/lib/api/config";
import { SystemIntegration } from "@/lib/systemIntegration";
// import { initializeVampireDatabase } from "@/lib/initVampireDatabase"; // Firebase not configured - using backend API instead
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

// Loading Screen
const LoadingScreen = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "16px", display: "inline-flex" }}>
        <div style={{ animation: "spin 1s linear infinite" }}>
          <div style={{ width: "32px", height: "32px", border: "4px solid #0ea5e9", borderTopColor: "transparent", borderRadius: "50%" }}></div>
        </div>
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>
        NEXUS<span style={{ color: "#0ea5e9" }}>OPS</span>
      </h1>
      <p style={{ color: "#666", fontSize: "14px" }}>Initializing Data Center Intelligence Platform...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

// Simple Error Component
const ErrorDisplay = ({ error, onReload }: { error: string; onReload: () => void }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a" }}>
    <div style={{ textAlign: "center", maxWidth: "500px", color: "#fff" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>⚠️ Error Loading App</h1>
      <p style={{ color: "#f87171", marginBottom: "16px", fontSize: "14px", wordBreak: "break-word" }}>{error}</p>
      <p style={{ color: "#999", marginBottom: "24px", fontSize: "12px" }}>Check the browser console (F12) for details.</p>
      <button
        onClick={onReload}
        style={{
          padding: "8px 24px",
          background: "#0ea5e9",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Reload Application
      </button>
    </div>
  </div>
);

const AppContent = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log("🚀 Starting app initialization...");
      
      // Initialize Energy Genome system on app startup
      const initResult = initializeEnergyGenome();
      console.log("✅ Energy Genome initialized:", initResult);
      
      if (initResult.configured) {
        SystemIntegration.emitUpdate("System", "Energy Genome API initialized successfully");
      } else if (initResult.errors.length > 0) {
        console.warn("⚠️ Energy Genome warnings:", initResult.errors);
        SystemIntegration.emitWarning("System", "Energy Genome using fallback/mock data", { errors: initResult.errors });
      }

      // Firebase not configured - using backend API for data
      console.log("🚀 Using backend API for data (Firebase disabled)");
      
      console.log("✅ Initialization complete - marking as ready");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("❌ Initialization error:", errorMsg, error);
      setError(errorMsg);
      // Also display in window for debugging
      (window as any).__APP_ERROR__ = errorMsg;
      return;
    }
    
    // Mark as ready after a brief delay
    const timer = setTimeout(() => {
      console.log("✅ App ready to display");
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return <ErrorDisplay error={error} onReload={() => window.location.reload()} />;
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
