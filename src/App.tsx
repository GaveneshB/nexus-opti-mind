import React, { useEffect, ReactNode, useState } from \"react\";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeEnergyGenome } from "@/lib/api/config";
import { SystemIntegration } from "@/lib/systemIntegration";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();\n\n// Loading Screen\nconst LoadingScreen = () => (\n  <div className=\"flex items-center justify-center h-screen bg-background\">\n    <div className=\"text-center\">\n      <div className=\"mb-4 inline-flex\">\n        <div className=\"animate-spin\">\n          <div className=\"h-8 w-8 border-4 border-primary border-t-transparent rounded-full\"></div>\n        </div>\n      </div>\n      <h1 className=\"text-2xl font-bold text-foreground mb-2\">NEXUS<span className=\"text-primary\">OPS</span></h1>\n      <p className=\"text-muted-foreground text-sm\">Initializing Data Center Intelligence Platform...</p>\n    </div>\n  </div>\n);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-background text-foreground">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">⚠️ Application Error</h1>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // Initialize Energy Genome system on app startup
      const initResult = initializeEnergyGenome();
      
      if (initResult.configured) {
        SystemIntegration.emitUpdate("System", "Energy Genome API initialized successfully");
      } else if (initResult.errors.length > 0) {
        console.warn("Energy Genome configuration warnings:", initResult.errors);
        SystemIntegration.emitWarning(
          "System",
          "Energy Genome using fallback/mock data",
          { errors: initResult.errors }
        );
      }
    } catch (error) {
      console.error("Failed to initialize Energy Genome:", error);
      // Continue anyway - app should still render
    }
    
    // Mark as ready after a brief delay to ensure all services are loaded
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
