import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import { LocaleProvider } from "@/lib/i18n";
import AppRoutes from "@/router/index.jsx";
import { useMaintenance } from "@/hooks/useMaintenance";
import MaintenancePage from "@/pages/MaintenancePage";

function AppContent() {
  const { isMaintenance, checked } = useMaintenance();

  if (!checked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return <AppRoutes />;
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || ''}>
      <AuthProvider>
        <LocaleProvider>
          <QueryClientProvider client={queryClientInstance}>
            <AppContent />
            <Toaster />
          </QueryClientProvider>
        </LocaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
