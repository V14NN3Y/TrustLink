import Sidebar from "./Sidebar";
import Header from "./Header";
import GlobalSearch from "./GlobalSearch";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import "@/lib/i18n";

export default function DashboardLayout({ children }) {
  useKeyboardShortcuts();
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <Header />
      <GlobalSearch />
      <main className="pt-16 min-h-screen bg-[#F9FAFB]" style={{ marginLeft: "256px" }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
