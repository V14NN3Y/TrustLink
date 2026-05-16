import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import { LocaleProvider } from "@/lib/i18n";
import AppRoutes from "@/router/index.jsx";

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AuthProvider>
        <LocaleProvider>
          <QueryClientProvider client={queryClientInstance}>
            <AppRoutes />
            <Toaster />
          </QueryClientProvider>
        </LocaleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
