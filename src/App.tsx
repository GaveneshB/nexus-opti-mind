import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeEnergyGenome } from "@/lib/api/config";
import { SystemIntegration } from "@/lib/systemIntegration";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
